import { useState, useEffect } from "react";
import API from "./api";  

function ProductForm() {

  const [form, setForm] = useState({
    name: "",
    price: "",
 
    image: null,
  });

  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");


  

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm({
      ...form,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
   
    formData.append("image", form.image);

    try {
      await API.post("/admin/products", formData);

      setMsg("Product added!");
      setForm({
        name: "",
        price: "",
  
        image: null,
      });

    
    } catch (err) {
      console.error(err);
      setMsg("Error adding product.");
    }
  };

  // const fetchProducts = async () => {
  //   try {
  //     const res = await API.get("/admin/products");
  //     setProducts(res.data);
  //   } catch (err) {
  //     console.error(err);
  //     setMsg("Error fetching products.");
  //   }
  // };

  // useEffect(() => {
  //   fetchProducts();
  // }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
        /><br />
        <input
          name="price"
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={handleChange}
        /><br />
       
        <input
          type="file"
          name="image"
          onChange={handleChange}
        /><br />
        <button type="submit">Add Product</button>
      </form>
      <p>{msg}</p>

      <h2>Products</h2>
      {products.map((p) => (
        <div key={p.id} style={{ margin: "20px 0" }}>
          <h3>{p.name}</h3>
          <p>Price: ₹{p.price}</p>
          <p>Category: {p.category}</p>
          <img src={p.imageUrl} alt={p.name} width="200" />
        </div>
      ))}
    </div>
  );
}

export default ProductForm;

