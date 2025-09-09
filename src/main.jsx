import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'; // ✅ you have this
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // ✅ add this too!
import '@fortawesome/fontawesome-free/css/all.min.css'; // ✅ for icons

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
)
