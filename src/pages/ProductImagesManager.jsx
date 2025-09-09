import React, { useState, useEffect } from "react";
import API from "./api";

export default function ProductImageUploader() {
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]); // Available colors from API
  const [selectedProduct, setSelectedProduct] = useState("");
  const [colorImageSets, setColorImageSets] = useState([
    { colorName: "", imageFiles: [] }
  ]);

  useEffect(() => {
    API.get("/admin/products").then((res) => setProducts(res.data));
    API.get(`/admin/products/colors/${1}`).then((res) => setColors(res.data)); // Fetch available colors
  }, []);

  const handleColorChange = (index, value) => {
    const updated = [...colorImageSets];
    updated[index].colorName = value;
    setColorImageSets(updated);
  };

  const handleImageChange = (index, files) => {
    const updated = [...colorImageSets];
    updated[index].imageFiles = Array.from(files); // single image per color
    setColorImageSets(updated);
  };

  const addColorImageSet = () => {
    setColorImageSets([...colorImageSets, { colorName: "", imageFiles: [] }]);
  };

  const removeColorImageSet = (index) => {
    setColorImageSets(colorImageSets.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (!selectedProduct) {
      alert("Please select a product first");
      return;
    }

    colorImageSets.forEach((set) => {
      const formData = new FormData();
      formData.append("colorName", set.colorName);
      if (set.imageFiles.length > 0) {
        formData.append("images", set.imageFiles[0]); // single image per color
      }

      API.post(`/admin/products/${selectedProduct}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(() => {
        console.log(`Image for ${set.colorName} uploaded`);
      });
    });

    alert("All images uploaded!");
    setColorImageSets([{ colorName: "", imageFiles: [] }]);
  };

  return (
    <div>
      <h2>Upload Product Images by Color</h2>

      {/* Product selection */}
      <select
        value={selectedProduct}
        onChange={(e) => setSelectedProduct(e.target.value)}
      >
        <option value="">Select Product</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Color-image mapping */}
      {colorImageSets.map((set, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ccc",
            margin: "10px",
            padding: "10px"
          }}
        >
          {/* Color dropdown */}
          <select
            value={set.colorName}
            onChange={(e) => handleColorChange(idx, e.target.value)}
          >
            <option value="">Select Color</option>
           {colors.map((color, index) => (
  <option key={index} value={color}>
    {color}
  </option>
))}

          </select>

          {/* Image upload (single image per color) */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(idx, e.target.files)}
          />

          {/* Preview */}
          {set.imageFiles.length > 0 && (
            <img
              src={URL.createObjectURL(set.imageFiles[0])}
              alt="preview"
              width="80"
              style={{ borderRadius: "4px", marginTop: "5px" }}
            />
          )}

          <br />
          <button onClick={() => removeColorImageSet(idx)}>Remove</button>
        </div>
      ))}

      <button onClick={addColorImageSet}>+ Add Another Color</button>
      <br />
      <button onClick={handleUpload}>Upload All</button>
    </div>
  );
}
