import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import PricesPage from './pages/PricesPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import MainPage from './pages/MainPage.jsx';
import VisionPage from './pages/VisionPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import EndpointPage from './pages/EndPointPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import FileListPage from './pages/FileListPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './pages/Navbar.jsx';
import IntroPage from './pages/IntroPage'; 

function App() {
  const [token, setToken] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedAdminToken = localStorage.getItem('adminToken');
    if (storedToken) setToken(storedToken);
    if (storedAdminToken) setAdminToken(storedAdminToken);
    setIsLoading(false);
  }, []);

  const handleLogin = (newToken, userEmail, isAdmin = false) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', userEmail);
    setToken(newToken);

    if (isAdmin) {
      localStorage.setItem('adminToken', newToken);
      setAdminToken(newToken);
    } else {
      localStorage.removeItem('adminToken');
      setAdminToken(null);
    }
  };

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/prices" element={<PricesPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/intro" element={<IntroPage />} /> 
        <Route path="/vision" element={<VisionPage />} />
        <Route
          path="/products"
          element={
            <ProtectedRoute token={adminToken}>
              <ProductPage isAdmin={Boolean(adminToken)} />
            </ProtectedRoute>
          }
        />
        <Route path="/endpoints" element={<EndpointPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute token={token}>
              <UploadPage token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/filelist"
          element={
            <ProtectedRoute token={token}>
              <FileListPage token={token} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;