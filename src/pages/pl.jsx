// AmazonStyleSinglePageForm.jsx
import React, { useState, useRef } from "react";
import  {  useEffect } from "react";
import API from "./api";

export default function AmazonStyleSinglePageForm() {
  // Basic product state
  const [product, setProduct] = useState({
    productIdType: "UPC", // UPC | EAN | ASIN | ISBN
    productId: "",
    title: "",
    brand: "",
    manufacturer: "",
    modelNumber: "",
    bullets: ["", "", "", "", ""], // 5 bullet points
    packageQuantity: 1,
    packageDimensions: "",
    weight: "",
    condition: "New", // New, Used, Refurbished
    currency: "USD",
    price: "",
    salePrice: "",
    stock: 0,
    sku: "",
    category: "",
    subcategory: "",
    description: "",
    searchTerms: "",
    genericKeywords: "",
    moreDetails: {},
    attributes: [], // [{ name: "Color", values: ["Red","Blue"] }]
    variants: [], // auto generated
    images: [], // { file, url, isPrimary }
  });

  // UI state
  const [activeTab, setActiveTab] = useState("vital"); // vital | variations | offer | images | description | keywords | more
  const fileInputRef = useRef(null);
  // State for categories and subcategories
const [categories, setCategories] = useState([]);
const [subcategories, setSubcategories] = useState([]);
const [attributes, setAttributes] = useState([]);
const [loadingAttributes, setLoadingAttributes] = useState(false);



  // ---------- Helpers ----------
  const setField = (key, value) =>
    setProduct((p) => ({ ...p, [key]: value }));

  const updateNested = (key, index, value) =>
    setProduct((p) => {
      const copy = { ...p };
      copy[key] = [...copy[key]];
      copy[key][index] = value;
      return copy;
    });

  // ---------- Bullets ----------
  const handleBulletChange = (idx, text) => {
    setProduct((p) => {
      const bullets = [...p.bullets];
      bullets[idx] = text;
      return { ...p, bullets };
    });
  };

  // ---------- Attributes & Variant Generation ----------
const addAttribute = () =>
  setProduct((p) => ({
    ...p,
    attributes: [
      ...p.attributes,
      { attributeId: "", name: "", rawValues: "", values: [] }
    ],
  }));


const removeAttribute = (idx) =>
  setProduct((p) => {
    const attributes = [...p.attributes];
    attributes.splice(idx, 1);
    return { ...p, attributes };
  });

// utility - compute cartesian product
const cartesian = (arrays) => {
  if (!arrays.length) return [];
  return arrays.reduce(
    (acc, curr) =>
      acc
        .map((a) => curr.map((b) => a.concat([b])))
        .reduce((a, b) => a.concat(b), []),
    [[]]
  );
};


const updateAttributeField = (index, field, value) => {
  setProduct((prev) => {
    const updatedAttrs = [...prev.attributes];
    updatedAttrs[index] = { ...updatedAttrs[index], [field]: value };
    return { ...prev, attributes: updatedAttrs };
  });
};


const generateVariants = () => {
  const attrValues = product.attributes.map((a) => a.values || []);
  if (attrValues.some((v) => v.length === 0)) {
    alert("Please ensure every attribute has at least one value.");
    return;
  }

  const combos = cartesian(attrValues);
  const variants = combos.map((combo, i) => {
    const nameParts = combo.map((v, j) => `${product.attributes[j].name}: ${v}`);
    return {
      id: `v_${i}_${Date.now()}`,
      name: nameParts.join(" | "),
      sku: "",
      price: product.price || "",
      stock: product.stock || 0,
      attributes: combo.map((val, idx) => ({
        name: product.attributes[idx].name,
        value: val
      })),
    };
  });
  setProduct((p) => ({ ...p, variants }));
};


const updateVariantField = (idx, field, value) =>
  setProduct((p) => {
    const variants = [...p.variants];
    variants[idx] = { ...variants[idx], [field]: value };
    return { ...p, variants };
  });

const removeVariant = (idx) =>
  setProduct((p) => {
    const variants = [...p.variants];
    variants.splice(idx, 1);
    return { ...p, variants };
  });



async function fetchAttributes() {
  try {
    setLoadingAttributes(true);
    const res = await API.get("/api/attributes"); // adjust API path
    setAttributes(res.data || []);
  } catch (err) {
    console.error("Failed to fetch attributes", err);
  } finally {
    setLoadingAttributes(false);
  }
}

// State
const [attributeValuesMap, setAttributeValuesMap] = useState({}); // {0: ["S","M","L"], 1: ["Red","Blue"]}

// Fetch values for a specific attribute row
const fetchAttributeValues = async (attributeId, rowIndex) => {
  if (!attributeId) return;
  try {
    const res = await API.get(`/api/attributes/${attributeId}/values`);
    setAttributeValuesMap(prev => ({
      ...prev,
      [rowIndex]: res.data // store for only that row
    }));
  } catch (err) {
    console.error("Error fetching attribute values", err);
  }
};

useEffect(() => {
  fetchAttributes();
}, []);







  // ---------- Image handling ----------
  const onFilesSelected = (files) => {
    const fileArr = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isPrimary: false,
      id: `${file.name}_${Date.now()}`,
    }));
    setProduct((p) => {
      // if no images before, mark first as primary
      const images = [...p.images, ...fileArr];
      if (!p.images.length && images.length) images[0].isPrimary = true;
      return { ...p, images };
    });
  };

  const handleImageInput = (e) => {
    onFilesSelected(e.target.files);
    // reset input to allow same file re-upload if needed
    e.target.value = null;
  };

  const removeImage = (idx) =>
    setProduct((p) => {
      const images = [...p.images];
      images.splice(idx, 1);
      if (images.length && !images.some((im) => im.isPrimary)) images[0].isPrimary = true;
      return { ...p, images };
    });

  const setPrimaryImage = (idx) =>
    setProduct((p) => {
      const images = p.images.map((im, i) => ({ ...im, isPrimary: i === idx }));
      return { ...p, images };
    });

  // Drag & drop reorder via HTML5 DnD
  const dragIndexRef = useRef(null);
  const handleDragStart = (e, idx) => {
    dragIndexRef.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDropOnImage = (e, targetIdx) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === undefined) return;
    setProduct((p) => {
      const images = [...p.images];
      const [moved] = images.splice(from, 1);
      images.splice(targetIdx, 0, moved);
      // keep primary flag consistent: if the moved image was primary, keep it primary
      // otherwise ensure at least one primary exists
      if (!images.some((im) => im.isPrimary)) images[0].isPrimary = true;
      return { ...p, images };
    });
    dragIndexRef.current = null;
  };
  const handleDragOver = (e) => e.preventDefault();

  // ---------- Submission (where you'd call API) ----------
const handleSubmit = (e) => {
  e.preventDefault();

  // ----- Minimal validation -----
  if (!product.title?.trim()) {
    setActiveTab("vital");
    alert("Please enter a product title.");
    return;
  }
  if (!product.category) {
    setActiveTab("vital");
    alert("Please pick a category.");
    return;
  }

  // ----- Helper: convert comma-separated strings to arrays -----
  const parseToArray = (value) =>
    typeof value === "string"
      ? value.split(",").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(value)
      ? value
      : [];

  // ----- Prepare attributes properly -----
  const attributesToSend = (product.attributes || []).map((attr) => ({
    ...attr,
    values: parseToArray(attr.values),
  }));

const variantsToSend = (product.variants || []).map((v) => ({
  ...v,
  attributes: (v.attributes || []).map(attr => {
    // if attr is object {name, value}, convert to "name: value"
    if (typeof attr === "object" && attr.name && attr.value) {
      return `${attr.name}: ${attr.value}`;
    }
    return attr; // already a string
  })
}));
  // ----- Prepare image metadata for JSON (exclude actual files) -----
  const imagesForJson = (product.images || []).map((imgObj, i) => ({
    isPrimary: imgObj.isPrimary,
    order: i,
  }));

  // ----- Build product object to send in JSON -----
  const productToSend = {
    ...product,
    currency: product.currency || "USD",
    condition: product.condition || "New",
    packageDimensions: product.packageDimensions || "",
    weight: product.weight || "",
    bullets: parseToArray(product.bullets),
    attributes: attributesToSend,
    variants: variantsToSend,
    genericKeywords: parseToArray(product.genericKeywords),
    searchTerms: parseToArray(product.searchTerms),
    moreDetails: product.moreDetails || {},
    images: imagesForJson, // only metadata for JSON
  };

  // ----- Build FormData -----
  const formData = new FormData();
  formData.append("product", JSON.stringify(productToSend));

  // ----- Add image files separately -----
  product.images?.forEach((imgObj) => {
    if (imgObj.file) {
      formData.append("images", imgObj.file, imgObj.file.name);
    }
  });

  // ----- Call API -----
  fetch("http://localhost:8080/api/product-details", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Product saved:", data);
      alert("Product saved successfully!");
    })
    .catch((err) => {
      console.error("Error saving product:", err);
      alert("Failed to save product. Check console.");
    });

  console.log("Prepared FormData (inspect in network):", productToSend);
};


  // ---------- Small UI Helpers ----------
  const TabButton = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-t-md -mb-px ${
        activeTab === id
          ? "bg-white border border-b-0 border-gray-300 text-gray-900 font-semibold"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

// fetch categories from backend
useEffect(() => {
  fetch("http://localhost:8080/api/categories")
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setCategories(data.filter((c) => c && c.id));
      } else {
        setCategories([]);
      }
    })
    .catch((err) => {
      console.error("Error loading categories:", err);
      setCategories([]);
    });
}, []);

// when category changes, update subcategory list
useEffect(() => {
  const selectedCat = categories.find(
    (cat) => cat.id === Number(product.category)
  );
  if (selectedCat && Array.isArray(selectedCat.subcategories)) {
    setSubcategories(selectedCat.subcategories.filter((s) => s && s.id));
  } else {
    setSubcategories([]);
  }
}, [product.category, categories]);




  // ---------- Render ----------
  return (
    <div className="max-w-6xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gray-100 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Add / Edit Product</h1>
            <div className="flex gap-2 items-center">
              <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">Save & Publish</button>
              <button type="button" onClick={() => alert("Draft saved (mock).")} className="bg-white border px-3 py-2 rounded">Save Draft</button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Single page multi-tab form — Amazon-like experience.</p>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-2 items-end">
            <TabButton id="vital" label="Vital Info" />
            <TabButton id="variations" label="Variations" />
            <TabButton id="offer" label="Offer" />
            <TabButton id="images" label="Images" />
            <TabButton id="description" label="Description" />
            <TabButton id="keywords" label="Keywords" />
            <TabButton id="more" label="More details" />
          </div>

          {/* Tab body */}
          <div className="mt-6 bg-white border border-gray-200 rounded-b-md p-6">
            {/* VITAL */}
            {activeTab === "vital" && (
              <section>
                <h2 className="text-lg font-medium mb-4">Vital Information</h2>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-8 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Title</label>
                      <input className="mt-1 block w-full border rounded p-2" value={product.title} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. Wireless Bluetooth Headphones" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <input className="mt-1 block w-1/2 border rounded p-2" value={product.brand} onChange={(e) => setField("brand", e.target.value)} placeholder="Brand name" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm text-gray-700">Manufacturer</label>
                        <input className="mt-1 block w-full border rounded p-2" value={product.manufacturer} onChange={(e) => setField("manufacturer", e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">Model Number</label>
                        <input className="mt-1 block w-full border rounded p-2" value={product.modelNumber} onChange={(e) => setField("modelNumber", e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">Condition</label>
                        <select className="mt-1 block w-full border rounded p-2" value={product.condition} onChange={(e) => setField("condition", e.target.value)}>
                          <option>New</option>
                          <option>Used</option>
                          <option>Refurbished</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700">Bullets (Key features)</label>
                      <div className="space-y-2 mt-1">
                        {product.bullets.map((b, i) => (
                          <input key={i} className="block w-full border rounded p-2" placeholder={`Bullet ${i + 1}`} value={b} onChange={(e) => handleBulletChange(i, e.target.value)} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 space-y-3">
                 
<select
  className="mt-1 block w-full border rounded p-2"
  value={product.category}
  onChange={(e) => setField("category", e.target.value)}
>
  <option value="">Select Category</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>

<select
  className="mt-1 block w-full border rounded p-2"
  value={product.subcategory}
  onChange={(e) => setField("subcategory", e.target.value)}
  disabled={!product.category}
>
  <option value="">Select Subcategory</option>
  {subcategories.map((sub) => (
    <option key={sub.id} value={sub.id}>
      {sub.name}
    </option>
  ))}
</select>




                    <div>
                      <label className="block text-sm text-gray-700">Product ID Type</label>
                      <select className="mt-1 block w-full border rounded p-2" value={product.productIdType} onChange={(e) => setField("productIdType", e.target.value)}>
                        <option>UPC</option>
                        <option>EAN</option>
                        <option>ISBN</option>
                        <option>ASIN</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700">Product ID</label>
                      <input className="mt-1 block w-full border rounded p-2" value={product.productId} onChange={(e) => setField("productId", e.target.value)} placeholder="0123456789012" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700">Package Quantity</label>
                      <input type="number" min="1" className="mt-1 block w-full border rounded p-2" value={product.packageQuantity} onChange={(e) => setField("packageQuantity", e.target.value)} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* VARIATIONS */}
{/* VARIATIONS */}
{activeTab === "variations" && (
  <section>
    <h2 className="text-lg font-medium mb-4">
      Variations (Attributes & Auto-Generated Variants)
    </h2>

    <div className="mb-4 text-sm text-gray-600">
      Define attributes (Color, Size, Material...). Select multiple values per attribute.
    </div>

    <div className="space-y-3">
      {product.attributes.map((attr, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          {/* ATTRIBUTE SELECT */}
          <div className="flex-1">
            <select
              className="border rounded p-2 w-full"
              value={attr.attributeId || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedAttr = attributes.find(a => String(a.id) === selectedId);
                if (selectedAttr) {
                  updateAttributeField(idx, "attributeId", selectedAttr.id);
                  updateAttributeField(idx, "name", selectedAttr.name);
                  fetchAttributeValues(selectedAttr.id, idx);
                }
              }}
            >
              <option value="">Select Attribute</option>
              {attributes.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* MULTI-VALUE SELECT */}
          <div className="flex-1">
            <div className="border rounded p-2 min-h-[3rem] flex flex-wrap gap-1 items-center bg-white max-h-40 overflow-y-auto">
              {/* SELECTED TAGS */}
              {attr.values?.map((val) => (
                <div
                  key={val}
                  className="bg-amber-100 text-amber-800 px-2 py-1 rounded flex items-center gap-1 text-sm"
                >
                  {val}
                  <button
                    type="button"
                    onClick={() => {
                      const newValues = attr.values.filter(v => v !== val);
                      updateAttributeField(idx, "values", newValues);
                    }}
                    className="text-amber-600 hover:text-amber-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* DROPDOWN */}
              <select
                className="flex-1 border-none focus:ring-0 focus:border-none p-1 text-gray-700"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !attr.values.includes(val)) {
                    updateAttributeField(idx, "values", [...attr.values, val]);
                  }
                  e.target.value = "";
                }}
              >
                <option value="">Select value...</option>
                {(attributeValuesMap[idx] || []).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* REMOVE ATTRIBUTE */}
          <button
            type="button"
            onClick={() => removeAttribute(idx)}
            className="text-red-600 px-3 py-1 border rounded"
          >
            Remove
          </button>
        </div>
      ))}

      {/* ADD ATTRIBUTE & GENERATE VARIANTS */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={addAttribute}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          + Add attribute
        </button>
        <button
          type="button"
          onClick={generateVariants}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Generate Variants
        </button>
      </div>
    </div>

    {/* GENERATED VARIANTS */}
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Generated Variants</h3>
      {product.variants.length === 0 ? (
        <div className="text-sm text-gray-500">
          No variants yet. Define attributes and click Generate Variants.
        </div>
      ) : (
        <div className="space-y-3">
          {product.variants.map((v, i) => (
            <div key={v.id} className="grid grid-cols-12 gap-2 items-center border p-2 rounded">
              <div className="col-span-6">
                <div className="text-sm font-medium">{v.name}</div>
                <div className="text-xs text-gray-500">
                  {v.attributes.map(a => `${a.name}: ${a.value}`).join(", ")}
                </div>
              </div>
              <input
                className="col-span-2 border p-2 rounded"
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariantField(i, "sku", e.target.value)}
              />
              <input
                type="number"
                className="col-span-2 border p-2 rounded"
                placeholder="Price"
                value={v.price}
                onChange={(e) => updateVariantField(i, "price", e.target.value)}
              />
              <input
                type="number"
                className="col-span-1 border p-2 rounded"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariantField(i, "stock", e.target.value)}
              />
              <div className="col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)}


            {/* OFFER */}
            {activeTab === "offer" && (
              <section>
                <h2 className="text-lg font-medium mb-4">Offer (Pricing & Inventory)</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-700">Currency</label>
                    <select className="mt-1 block w-full border rounded p-2" value={product.currency} onChange={(e) => setField("currency", e.target.value)}>
                      <option>USD</option>
                      <option>EUR</option>
                      <option>INR</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Price</label>
                    <input type="number" className="mt-1 block w-full border rounded p-2" value={product.price} onChange={(e) => setField("price", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Sale Price (optional)</label>
                    <input type="number" className="mt-1 block w-full border rounded p-2" value={product.salePrice} onChange={(e) => setField("salePrice", e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Available Stock</label>
                    <input type="number" className="mt-1 block w-full border rounded p-2" value={product.stock} onChange={(e) => setField("stock", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">SKU (Seller)</label>
                    <input className="mt-1 block w-full border rounded p-2" value={product.sku} onChange={(e) => setField("sku", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Fulfillment / Shipping</label>
                    <select className="mt-1 block w-full border rounded p-2">
                      <option>Merchant fulfilled</option>
                      <option>Fulfilled by Marketplace</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            {/* IMAGES */}
            {activeTab === "images" && (
              <section>
                <h2 className="text-lg font-medium mb-4">Images (Upload / Preview / Reorder)</h2>
                <div className="mb-3">
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageInput} />
                </div>

                <div className="flex flex-wrap gap-3">
                  {product.images.map((img, idx) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnImage(e, idx)}
                      className={`relative w-36 h-36 border rounded flex-shrink-0 overflow-hidden ${img.isPrimary ? "ring-2 ring-amber-400" : ""}`}
                    >
                      <img src={img.url} alt={`img-${idx}`} className="object-cover w-full h-full" />
                      <div className="absolute top-1 right-1 flex gap-1">
                        <button type="button" onClick={() => removeImage(idx)} className="bg-white/80 p-1 rounded text-red-600 text-xs">Delete</button>
                      </div>
                      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between px-2">
                        <button type="button" onClick={() => setPrimaryImage(idx)} className={`text-xs px-2 py-1 rounded ${img.isPrimary ? "bg-amber-600 text-white" : "bg-white/80"}`}>
                          {img.isPrimary ? "Primary" : "Make Primary"}
                        </button>
                        <div className="text-xs text-white bg-black/40 px-2 rounded">{idx + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-sm text-gray-600">Tip: Drag images to reorder. Primary image is outlined.</p>
              </section>
            )}

            {/* DESCRIPTION */}
            {activeTab === "description" && (
              <section>
                <h2 className="text-lg font-medium mb-4">Product Description</h2>
                <textarea rows="8" className="w-full border rounded p-3" value={product.description} onChange={(e) => setField("description", e.target.value)} placeholder="Long description, features, usage, care instructions..." />
              </section>
            )}

            {/* KEYWORDS */}
            {activeTab === "keywords" && (
              <section>
                <h2 className="text-lg font-medium mb-4">Search Terms & Keywords</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700">Search Terms (comma separated)</label>
                    <input className="mt-1 block w-full border rounded p-2" value={product.searchTerms} onChange={(e) => setField("searchTerms", e.target.value)} placeholder="wireless, bluetooth, headphones" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Generic Keywords</label>
                    <input className="mt-1 block w-full border rounded p-2" value={product.genericKeywords} onChange={(e) => setField("genericKeywords", e.target.value)} placeholder="portable, noise-cancelling" />
                  </div>
                </div>
              </section>
            )}

            {/* MORE DETAILS */}
            {activeTab === "more" && (
              <section>
                <h2 className="text-lg font-medium mb-4">More Details & Compliance</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700">Package Dimensions (LxWxH)</label>
                    <input className="mt-1 block w-full border rounded p-2" value={product.packageDimensions} onChange={(e) => setField("packageDimensions", e.target.value)} placeholder="10x8x3 cm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Weight</label>
                    <input className="mt-1 block w-full border rounded p-2" value={product.weight} onChange={(e) => setField("weight", e.target.value)} placeholder="0.5 kg" />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Manufacturer Part Number</label>
                    <input className="mt-1 block w-full border rounded p-2" value={product.manufacturerPartNumber} onChange={(e) => setField("manufacturerPartNumber", e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Compliance / Certifications</label>
                    <input className="mt-1 block w-full border rounded p-2" value={product.compliance} onChange={(e) => setField("compliance", e.target.value)} placeholder="CE, RoHS" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm text-gray-700">Additional Key-Value Details (optional)</label>
                  <textarea className="mt-1 block w-full border rounded p-2" rows="4" value={JSON.stringify(product.moreDetails || {}, null, 2)} onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value || "{}");
                      setField("moreDetails", parsed);
                    } catch (err) { /* ignore */ }
                  }} />
                  <p className="text-xs text-gray-500 mt-1">You can paste JSON here for advanced product metadata.</p>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">Preview: <strong>{product.title || "Untitled product"}</strong> • Category: {product.category || "—"}</div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { setProduct({
              productIdType: "UPC", productId: "", title: "", brand: "", manufacturer: "", modelNumber: "",
              bullets: ["", "", "", "", ""], packageQuantity:1, packageDimensions:"", weight:"", condition:"New",
              currency:"USD", price:"", salePrice:"", stock:0, sku:"", category:"", subcategory:"", description:"",
              searchTerms:"", genericKeywords:"", moreDetails:{}, attributes:[], variants:[], images:[]
            }); }} className="px-3 py-2 border rounded">Reset</button>
            <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">Save & Publish</button>
          </div>
        </div>
      </form>
    </div>
  );
}
