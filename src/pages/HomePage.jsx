import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import oip2 from '../assets/One.webp'
import oip3 from '../assets/Two.webp'
import vision from '../assets/Three.png'
import '../HomePage.css';

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
    
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/user/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      {/* Carousel */}
      <div id="carouselExample" className="carousel slide mb-5" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src={oip2}
              className="d-block w-100" alt="Slide 1"/>
          </div>
          <div className="carousel-item">
            <img src={oip3}
              className="d-block w-100" alt="Slide 2"/>
          </div>
          <div className="carousel-item">
            <img src={vision}
              className="d-block w-100" alt="Slide 3"/>
          </div>
        </div>
        <button className="carousel-control-prev" type="button"
                data-bs-target="#carouselExample" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button"
                data-bs-target="#carouselExample" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* Products */}
      <div className="row">
        {products.map(product => (
          <div key={product.id} className="col-md-3 mb-4">
            <div className="card h-100 product-card">
              <img
                src={product.imageUrl}
                className="card-img-top"
                alt={product.name}
              />
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text text-success fw-bold">
                  ₹ {product.price}
                </p>
                <p className="card-text text-muted small">
                  <i className="fas fa-star text-warning"></i> {product.rating || 4.5} / 5
                </p>
                <Link to={`/product/${product.id}`} className="btn btn-primary w-100">
                  <i className="fas fa-eye"></i> View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
