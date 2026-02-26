import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import ServicesPage from './pages/ServicesPage.jsx';
import PricesPage from './pages/PricesPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import MainPage from './pages/MainPage.jsx';
import VisionPage from './pages/VisionPage.jsx';
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
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (storedToken) setToken(storedToken);
    if (storedUsername) setUsername(storedUsername);
    setIsLoading(false);
  }, []);

  const handleLogin = (newToken, userEmail) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', userEmail);
    setToken(newToken);
    setUsername(userEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
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