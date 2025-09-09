import React, { useState, useEffect } from "react";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Load categories
  useEffect(() => {
    fetch("http://localhost:8080/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // remove null/undefined elements from backend
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

  // Add category
  const addCategory = () => {
    if (!categoryName.trim()) return;
    fetch("http://localhost:8080/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryName }),
    })
      .then((res) => res.json())
      .then((newCat) => {
        if (newCat && newCat.id) {
          setCategories((prev) => [...prev, { ...newCat, subcategories: [] }]);
        }
        setCategoryName("");
      })
      .catch((err) => console.error("Error adding category:", err));
  };

  const addSubcategory = () => {
  if (!subcategoryName.trim() || !selectedCategory) return;

  fetch(
    `http://localhost:8080/api/categories/${selectedCategory}/subcategories`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: subcategoryName }),
    }
  )
    .then((res) => res.json())
    .then((newSub) => {
      if (newSub && newSub.id) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === Number(selectedCategory)
              ? {
                  ...cat,
                  subcategories: [
                    ...(cat.subcategories || []),
                    {
                      id: newSub.id,
                      name: newSub.name,
                    },
                  ],
                }
              : cat
          )
        );
      }
      setSubcategoryName("");
    })
    .catch((err) => console.error("Error adding subcategory:", err));
};


  return (
    <div style={{ padding: "20px" }}>
      <h2>Category & Subcategory Manager</h2>

      {/* Add Category */}
      <div>
        <input
          placeholder="Category name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <button onClick={addCategory}>Add Category</button>
      </div>

      {/* Add Subcategory */}
      <div style={{ marginTop: "10px" }}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories
            .filter((c) => c && c.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        <input
          placeholder="Subcategory name"
          value={subcategoryName}
          onChange={(e) => setSubcategoryName(e.target.value)}
        />
        <button onClick={addSubcategory} disabled={!selectedCategory}>
          Add Subcategory
        </button>
      </div>

      {/* Display List */}
      <div style={{ marginTop: "20px" }}>
        {categories
          .filter((cat) => cat && cat.id)
          .map((cat) => (
            <div key={cat.id} style={{ marginBottom: "10px" }}>
              <strong>{cat.name}</strong>
              <ul>
                {(cat.subcategories || []).map((sub) =>
                  sub && sub.id ? <li key={sub.id}>{sub.name}</li> : null
                )}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
