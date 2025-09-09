import { useState } from 'react';
import API from './api';
import { useNavigate } from 'react-router-dom';
function Register() {
    const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await API.post('/auth/register', form);
      setMsg(res.data);
           navigate('/login');
    } catch (err) {
       // check structure!
  setMsg(err.response.data.errors);  
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input name="username" onChange={handleChange} placeholder="Username" />
      <input name="email" onChange={handleChange} placeholder="Email" />
      <input name="password" onChange={handleChange} placeholder="Password" type="password" />
      <button onClick={handleSubmit}>Register</button>
      <p>{msg}</p>
    </div>
  );
}

export default Register;