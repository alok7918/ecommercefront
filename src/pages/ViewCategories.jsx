// admin/src/pages/ViewCategories.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "./api";

function ViewCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
  API.get("/api/categories").then((res) => setCategories(res.data));
  }, []);

  return (
    <div>
      <h2>All Categories</h2>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ViewCategories;
