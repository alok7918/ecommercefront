import { useEffect, useState } from "react";
import API from "./api";

function VProducts() {
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000); // adjust as needed

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/user/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

const searchProducts = async () => {
  try {
    const res = await API.get("/user/products/search", {
      params: {
        name: searchTerm
      }
    });
  setProducts(res.data);
    setMsg(`Showing results for "${searchTerm}"`);
  } catch (err) {
    console.error(err);
    setMsg("Error searching products");
  }
};


  const filterByPrice = async () => {
    try {
      const res = await API.get("/user/products/filter", {
        params: {
          minPrice: minPrice,
          maxPrice: maxPrice
        }
      });
      setProducts(res.data);
      setMsg(`Showing products from ₹${minPrice} to ₹${maxPrice}`);
    } catch (err) {
      console.error(err);
      setMsg("Error filtering products");
    }
  };


const sortProductsByName = async (order = "asc") => {
  try {
    const res = await API.get("/user/products/sort", {
      params: { order },
    });
    setProducts(res.data);
    setMsg(`Sorted by name (${order.toUpperCase()})`);
  } catch (err) {
    console.error(err);
    setMsg("Error sorting products");
  }
};



  const addToCart = async (productId) => {
    try {
      const username = localStorage.getItem("username");
      await API.post(`/api/cart/add`, null, {
        params: {
          productId: productId,
          quantity: 1,
          username: username
        }
      });
      setMsg("Product added to cart!");
    } catch (err) {
      console.error(err);
      setMsg("Error adding to cart");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Products</h2>

<div style={{ marginBottom: "20px" }}>
  <button onClick={() => sortProductsByName("asc")}>Sort A-Z</button>
  <button onClick={() => sortProductsByName("desc")} style={{ marginLeft: "10px" }}>
    Sort Z-A
  </button>
</div>




      {/* Search input */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />{" "}
        <button onClick={searchProducts}>Search</button>
        <button onClick={fetchProducts} style={{ marginLeft: "10px" }}>
          Clear
        </button>
      </div>

      {/* Price range slider */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Min Price: ₹{minPrice}
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            style={{ margin: "0 10px" }}
          />
        </label>
        <br />
        <label>
          Max Price: ₹{maxPrice}
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ margin: "0 10px" }}
          />
        </label>
        <br />
        <button onClick={filterByPrice}>Filter by Price</button>
      </div>

      {msg && <p>{msg}</p>}

      {products.length === 0 && <p>No products found.</p>}

      {products.map((p) => (
        <div
          key={p.id}
          style={{ border: "1px solid #ddd", margin: "10px", padding: "10px" }}
        >
          <h3>{p.name}</h3>
          <img src={p.imageUrl} alt={p.name} width="200" />
          <p>Price: ₹{p.price}</p>
          <p>Category: {p.category}</p>
          <button onClick={() => addToCart(p.id)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}

export default VProducts;
