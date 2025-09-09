// Dashboard.jsx
import { useEffect, useState } from 'react';
import API from './api';
import { useNavigate } from 'react-router-dom';
import {  Link } from 'react-router-dom'; 

function Dashboard() {
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  useEffect(() => {
    const token = localStorage.getItem('token');
    // const role = localStorage.getItem('role');

    if (!token) {
      navigate('/login'); // Not logged in, redirect to login
      return;
    }

    const fetchDashboard = async () => {
      try {
        let res;
        if (role === 'ROLE_ADMIN') {
          res = await API.get('/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else if (role === 'ROLE_USER') {
          res = await API.get('/user/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        setMsg(res.data);
      } catch (err) {
        console.error(err);
        setMsg('Token invalid or expired');
        localStorage.clear();
        navigate('/login');
      }
    };

    fetchDashboard();
  }, []);

  return (
    <>
    <div>
      <h2>Dashboard</h2>
      <p>{msg}</p>



      {role === 'ROLE_ADMIN' && (
        <div>
          <Link to="/dashboard/product">Add Product</Link> <br/>
          <Link to="/dashboard/orders">Manage Orders</Link>
         </div>









      )}

  



      <button onClick={() => {
        localStorage.clear();
        navigate('/login');
      }}>Logout</button>
    </div>
    </>
  );
}

export default Dashboard;
