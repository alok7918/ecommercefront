// App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import API from './pages/api';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductForm from './pages/Product';
import VProducts from './pages/viewproduct';
import Cart from './pages/cart';
import OrderTracking from './pages/OrderTracking';
import AdminOrders from './pages/AdminOrders';
import HomePage from './pages/HomePage';
import ProductDetails from './pages/ProductDetails';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AdminAssignAttributes from './pages/AdminAssignAttributes';
import CreateVariants from './pages/CreateVariants';
import ProductDetail from './pages/ProductDetail';
import ProductImagesManager from './pages/ProductImagesManager';
import ProductListingForm from './pages/pl';
import CategoryManager from './pages/A';


function Footer() {
  return (
    <footer className="bg-dark text-light text-center py-3 mt-5">
      <div className="container">
        <p>&copy; 2025 MyShop. All rights reserved.</p>
      </div>
    </footer>
  );
}

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState(localStorage.getItem("username"));

  // ✅ Load cart count on page load
  useEffect(() => {
    const fetchCartCount = async () => {
      if (username) {
        try {
          const res = await API.get("/api/cart/count", {
            params: { username }
          });
          setCartCount(res.data);
        } catch (err) {
          console.error("Error fetching cart count:", err);
        }
      }
    };
    fetchCartCount();
  }, [username]); // ✅ Re-run when username changes!

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.clear();
    setUsername(null);
    setCartCount(0);
    window.location.href = "/login"; // Or use navigate
  };

  // ✅ Navbar component inside App
  function Navbar() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">MyShop</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarNav" aria-controls="navbarNav"
            aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">

              {/* ✅ Show Register/Login if NOT logged in */}
              {!username && (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                </>
              )}

              <li className="nav-item"><Link className="nav-link" to="/products">Show Products</Link></li>

              <li className="nav-item">
                <Link className="nav-link" to="/cart">
                  <i className="fas fa-shopping-cart"></i> Cart
                  {cartCount > 0 && (
                    <span className="badge bg-danger ms-1">{cartCount}</span>
                  )}
                </Link>
              </li>

              <li className="nav-item"><Link className="nav-link" to="/orders">Track Orders</Link></li>
            
              <li className="nav-item"><Link className="nav-link" to="/admin/orders">Admin Orders</Link></li>

              <li className="nav-item"><Link className="nav-link" to="/ad">attr</Link></li>

               <li className="nav-item"><Link className="nav-link" to="/pd">pd</Link></li>

                            <li className="nav-item"><Link className="nav-link" to="/var">var</Link></li>

                                  <li className="nav-item"><Link className="nav-link" to="/pli">pli</Link></li>

                            
                            <li className="nav-item"><Link className="nav-link" to="/im">im</Link></li>



<li className="nav-item"><Link className="nav-link" to="/Ac">Addcategoruy</Link></li>

              {/* ✅ Show dropdown if logged in */}
              {username && (
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    {username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </li>
              )}

            </ul>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <Navbar />




      <div className="container mt-4">
        {/* <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={
            <Login setCartCount={setCartCount} setUsername={setUsername} />
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product" element={<ProductForm />} />
          <Route path="/products" element={<VProducts />} />
          <Route path="/cart" element={<Cart setCartCount={setCartCount} />} />
          <Route path="/orders" element={<OrderTracking />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/product/:id" element={
            <ProductDetails setCartCount={setCartCount} />
          } />
        </Routes> */}


<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/register" element={<Register />} />
  <Route path="/login" element={
    <Login setCartCount={setCartCount} setUsername={setUsername} />
  } />
  <Route path="/cart" element={<Cart setCartCount={setCartCount} />} />
  <Route path="/orders" element={<OrderTracking />} />
    <Route path="/ad" element={< AdminAssignAttributes />} />
    <Route path="/var" element={< CreateVariants />} />
     <Route path="/pd" element={< ProductDetail/>} />
      <Route path="/pli" element={<  ProductListingForm />} />
       <Route path="/im" element={<   ProductImagesManager  />} />
        <Route path="/Ac" element={<  CategoryManager  />} />
  <Route path="/product/:id" element={<ProductDetails setCartCount={setCartCount} />} />
 <Route path="/dashboard/product" element={<ProductForm />} />
     <Route path="/dashboard/orders" element={<AdminOrders />} />

  {/* ✅ Admin Dashboard with Sidebar Layout */}
  <Route path="/dashboard" element={<Dashboard />}>
   
  
    <Route path="view-products" element={<VProducts />} />
  </Route>
</Routes>




      </div>

      <Footer />
    </>
  );
}

export default App;
