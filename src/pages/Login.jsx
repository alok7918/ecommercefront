import { useState, useEffect } from 'react';
import API from './api';
import { useNavigate } from 'react-router-dom';

function Login({setCartCount, setUsername}) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
  try {
    const res = await API.post('/auth/login', form);

  const token = res.data.token;
    const role = res.data.role;
    const username = res.data.username;



    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', res.data.role);
    localStorage.setItem('username', res.data.username);

    setMsg('✅ Login successful');

    if(role==='ROLE_USER'){
const countRes = await API.get('/api/cart/count', {
  params: { username }
});
setCartCount(countRes.data);
setUsername(res.data.username);
  navigate('/');
    }
    else{
navigate('/dashboard');
setUsername(res.data.username);
    }

} catch (err) {
    setMsg('❌ Login failed');
    console.error(err);
  }
};

  // ✅ Step 1: Send OTP
  const handleSendOtp = async () => {
    try {
      const res = await API.post('/auth/send-otp', null, {
        params: { email: email }
      });
      setForgotMsg(res.data || 'OTP sent!');
    } catch (err) {
      console.error(err);
      setForgotMsg('❌ Failed to send OTP');
    }
  };

  // ✅ Step 2: Verify OTP + Reset Password
  const handleVerifyOtp = async () => {
    try {
      const res = await API.post('/auth/verify-otp', null, {
        params: {
          email: email,
          otp: otp,
          newPassword: newPassword
        }
      });
      setForgotMsg(res.data || 'Password reset!');
    } catch (err) {
      console.error(err);
      setForgotMsg('❌ Failed to verify OTP');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Login</h2>
      <input
        name="username"
        onChange={handleChange}
        placeholder="Username"
        className="form-control mb-2"
      />
      <input
        name="password"
        onChange={handleChange}
        placeholder="Password"
        type="password"
        className="form-control mb-2"
      />
      <button className="btn btn-primary mb-2" onClick={handleLogin}>
        Login
      </button>
      <p>{msg}</p>

      {/* ✅ Forgot Password */}
      {!showForgot && (
        <p>
          <button className="btn btn-link" onClick={() => setShowForgot(true)}>
            Forgot Password?
          </button>
        </p>
      )}

      {showForgot && (
        <div style={{ marginTop: '20px' }}>
          <h4>Forgot Password</h4>
          <input
            type="email"
            placeholder="Enter your email"
            className="form-control mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="btn btn-warning mb-2" onClick={handleSendOtp}>
            Send OTP
          </button>

          <input
            type="text"
            placeholder="Enter OTP"
            className="form-control mb-2"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <input
            type="password"
            placeholder="New Password"
            className="form-control mb-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button className="btn btn-success" onClick={handleVerifyOtp}>
            Reset Password
          </button>

          <p className="mt-2">{forgotMsg}</p>
        </div>
      )}
    </div>
  );
}

export default Login;
