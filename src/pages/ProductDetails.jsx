import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from './api';
import StarRatings from 'react-star-ratings';





export default function ProductDetails({ setCartCount }) {
  const { id } = useParams(); // ✅ id is your product ID
  const [product, setProduct] = useState(null);
  const [msg, setMsg] = useState('');
  const [ratings, setRatings] = useState([]);
  const [canRate, setCanRate] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchRatings();
      checkIfCanRate();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/user/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await API.get(`/api/ratings/${id}`);
      setRatings(res.data);
    } catch (err) {
      console.error('Error fetching ratings', err);
    }
  };

  const checkIfCanRate = async () => {
    try {
      const res = await API.get(`/api/ratings/${id}/can-rate`);
      setCanRate(res.data);
      console.log(res.data);
    } catch (err) {
      console.error('Error checking if can rate', err);
    }
  };

  const submitRating = async () => {
    try {
      await API.post(`/api/ratings/${id}`, {
        rating: myRating,
        comment: myComment,
      });
      setMyRating(0);
      setMyComment('');
      fetchRatings();
    } catch (err) {
      console.error('Error submitting rating', err);
    }
  };

const addToCart = async (productId) => {
  try {
    const username = localStorage.getItem("username");

    // Add product to cart
    await API.post(`/api/cart/add`, null, {
      params: {
        productId: productId,
        quantity: 1,
        username: username
      }
    });

    setMsg("✅ Product added to cart!");

    // ✅ Fetch latest cart count after adding
    const res = await API.get("/api/cart/count", {
      params: { username }
    });

    // ✅ Update the cart count in App state
    if (typeof setCartCount === 'function') {
      setCartCount(res.data);
    }

  } catch (err) {
    console.error(err);
    setMsg("❌ Error adding to cart");
  }
};

  const handleAddToCart = () => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("Please login or register to add items to your cart.");
      navigate('/login');
      return;
    }

    addToCart(product.id);
  };

  const averageRating = ratings.length
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 'No ratings yet';

  if (!product) return <p>Loading...</p>;

  return (
    <div className="container mt-5">
      <div className="row">
        {/* ✅ Product info */}
        <div className="col-md-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="img-fluid"
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <h4 className="text-success">₹ {product.price}</h4>
          <p>{product.description}</p>

          {/* ✅ Average Rating */}
          <p><strong>⭐ Average Rating:</strong> {averageRating}{averageRating !== 'No ratings yet' ? ' / 5' : ''}</p>

          <button className="btn btn-warning" onClick={handleAddToCart}>
            <i className="fas fa-shopping-cart"></i> Add to Cart
          </button>
          {msg && <p className="mt-3">{msg}</p>}
        </div>
      </div>

      {/* ✅ Ratings List */}
      <div className="mt-5">
        <h4>Customer Ratings:</h4>
        {ratings.length === 0 && <p>No ratings yet.</p>}
        {ratings.map(r => (
          <div key={r.id} className="border p-3 mb-2">
       <StarRatings
              edit={false}
              rating={r.rating}
              starRatedColor="gold"
              numberOfStars={5}
              starDimension="20px"
            />
            <p>{r.comment}</p>
            <small>By User ID: {r.user.id}</small>
          </div>
        ))}
      </div>

      {/* ✅ Star Input for eligible users */}
      {canRate && (
        <div className="mt-5">
          <h4>Leave Your Rating</h4>
        
<StarRatings
            rating={myRating}
            starRatedColor="gold"
            starHoverColor="gold"
            changeRating={(newRating) => setMyRating(newRating)}
            numberOfStars={5}
            name="rating"
            starDimension="30px"
          />
   




          <textarea
            placeholder="Your comment"
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            className="form-control mt-2"
          />
          <button className="btn btn-primary mt-2" onClick={submitRating}>
            Submit Rating
          </button>
        </div>
      )}
    </div>
  );
}
