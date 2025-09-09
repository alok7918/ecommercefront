import { useEffect, useState } from "react";
import API from "./api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0); // zero-based index
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = async (pageNumber = 0) => {
    try {
      const res = await API.get("/api/admin/orders", {
        params: { page: pageNumber, size: 2 },
      });
      setOrders(res.data.content);
      setPage(res.data.number);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, []);

  const handlePageChange = (newPage) => {
    fetchOrders(newPage);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/api/admin/orders/${orderId}/status`, null, {
        params: { status: newStatus },
      });

    fetchOrders(page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await API.delete(`/api/admin/orders/${orderId}`);
      // Re-fetch the orders for the current page
      fetchOrders(page);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Orders</h2>
      {orders.map((order) => (
        <div key={order.id} style={{ border: "1px solid #ddd", margin: "10px", padding: "10px" }}>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>User:</strong> {order.username}</p>

          {/* ✅ Status Select */}
          <p><strong>Status:</strong> 
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order.id, e.target.value)}
              style={{ marginLeft: "10px" }}
            >
              <option value="Placed">Placed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </p>

          <h4>Items:</h4>
          {order.items.map((item) => (
            <p key={item.id}>{item.product.name} x {item.quantity}</p>
          ))}

          {/* ✅ Delete button */}
          <button onClick={() => handleDeleteOrder(order.id)} style={{ background: "red", color: "white" }}>
            Delete Order
          </button>
        </div>
      ))}

      {/* ✅ Pagination */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            style={{ margin: "0 5px", fontWeight: page === index ? "bold" : "normal" }}
            onClick={() => handlePageChange(index)}
          >
            {index + 1}
          </button>
        ))}

        <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1}>
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminOrders;
