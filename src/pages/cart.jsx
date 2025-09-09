import { useEffect, useState } from "react";
import API from "./api";

function Cart({ setCartCount }) {
  const [cartItems, setCartItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [total, setTotal] = useState(0);

  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      setMsg("You must be logged in to see your cart");
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get("/api/cart", {
        params: { username }
      });
      setCartItems(res.data);
      calculateTotal(res.data);
    } catch (err) {
      console.error(err);
      setMsg("Error fetching cart");
    }
  };

  const calculateTotal = (items) => {
    let sum = 0;
    items.forEach((item) => {
      sum += item.product.price * item.quantity;
    });
    setTotal(sum);
  };

  const updateQuantity = async (id, newQuantity) => {
    try {
      await API.post(`/api/cart/update`, null, {
        params: { id, quantity: newQuantity },
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      // ✅ Call backend to create Razorpay order
      const res = await API.post("/api/payment/create-order", {
        amount: total,
        currency: "INR",
        username: username,
      });

      const { orderId, razorpayKey } = res.data;

      // ✅ Open Razorpay checkout
      const options = {
        key:razorpayKey,
        amount: total * 100, // in paise
        currency: "INR",
        name: "My Shop",
        description: "Order Payment",
        order_id: orderId,
        handler: async (response) => {
          
          // ✅ Call backend to verify payment and clear cart
          await API.post("/api/payment/verify", {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            username: username,
          });



    await API.post('/api/cart/checkout', null, {
      params: { username: localStorage.getItem('username') }
    });

    alert('Payment successful! Cart cleared.');


setCartCount(0);

    


          setMsg("Payment successful!");
          fetchCart();
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setMsg("Payment failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Cart</h2>
      <p>User: {username}</p>
      {msg && <p>{msg}</p>}

      {cartItems.length === 0 && !msg && <p>Your cart is empty.</p>}

      {cartItems.map((item) => (
        <div key={item.id} style={{ border: "1px solid #ddd", margin: "10px", padding: "10px" }}>
          <h3>{item.product.name}</h3>
          <img src={item.product.imageUrl} alt={item.product.name} width="100" />
          <p>Price: ₹{item.product.price}</p>
          <p>Quantity: {item.quantity}</p>
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
        </div>
      ))}

      {cartItems.length > 0 && (
        <>
          <h3>Total: ₹{total}</h3>
          <button onClick={handleCheckout}>Pay with Razorpay</button>
        </>
      )}
    </div>
  );
}

export default Cart;




