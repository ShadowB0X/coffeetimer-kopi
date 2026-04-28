import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';


import PricesPage from './pages/PricesPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import MainPage from './pages/MainPage.jsx';
import VisionPage from './pages/VisionPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Navbar from './pages/Navbar.jsx';
import IntroPage from './pages/IntroPage'; 
import ProductsPage from './pages/ProductsPage.jsx';

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

  

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/services" element={<ProductsPage/>} />
        <Route path="/prices" element={<PricesPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/intro" element={<IntroPage />} /> 
        <Route path="/vision" element={<VisionPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} 
        />
      
        
      </Routes>
    </>
  );
}

export default App;