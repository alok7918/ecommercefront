import React, { useEffect, useState } from "react";
import API from "./api"; // axios instance

function CreateVariants() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [variants, setVariants] = useState([]);

  // Fetch all products
  useEffect(() => {
    API.get("/admin/products").then((res) => setProducts(res.data));
  }, []);

  // Fetch attributes for selected product
  useEffect(() => {
    if (selectedProductId) {
      API.get(`/admin/products/${selectedProductId}`).then((res) => {
        setAttributes(res.data.attributes || []);
      });
    }
  }, [selectedProductId]);

  // Add new empty variant row
  const handleAddVariant = () => {
    const newVariant = {};
    attributes.forEach((attr) => {
      newVariant[attr.name] = "";
    });
    newVariant.price = "";
    newVariant.stock = "";
    setVariants([...variants, newVariant]);
  };

  // Handle change in variant selection
  const handleVariantChange = (index, key, value) => {
    const updated = [...variants];
    updated[index][key] = value;
    setVariants(updated);
  };

  // Remove a variant row
  const handleRemoveVariant = (index) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  // Submit variants
  const handleSubmit = () => {
    API.post(`/admin/products/${selectedProductId}/variants`, variants)
      .then(() => {
        alert("Variants created successfully");
        setVariants([]);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Product Variants</h2>

      {/* Select Product */}
      <select
        value={selectedProductId}
        onChange={(e) => setSelectedProductId(e.target.value)}
      >
        <option value="">-- Select Product --</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Show Variant Form if product selected */}
      {selectedProductId && (
        <>
          <button onClick={handleAddVariant} style={{ margin: "10px 0" }}>
            + Add Variant
          </button>

          <table border="1" cellPadding="5" style={{ width: "100%" }}>
            <thead>
              <tr>
                {attributes.map((attr) => (
                  <th key={attr.id}>{attr.name}</th>
                ))}
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr key={index}>
                  {attributes.map((attr) => (
                    <td key={attr.id}>
                      <select
                        value={variant[attr.name]}
                        onChange={(e) =>
                          handleVariantChange(index, attr.name, e.target.value)
                        }
                      >
                        <option value="">-- Select --</option>
                        {attr.values.map((val) => (
                          <option key={val.id} value={val.value}>
                            {val.value}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(index, "stock", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => handleRemoveVariant(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {variants.length > 0 && (
            <button onClick={handleSubmit} style={{ marginTop: "10px" }}>
              Save Variants
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default CreateVariants;
