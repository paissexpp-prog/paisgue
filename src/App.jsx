import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Deposit from './pages/Deposit'; 
import History from './pages/History';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

         {/* Placeholder untuk halaman lain agar tidak error */}
        <Route path="/deposit" element={
          <PrivateRoute>
             <div className="p-5">Halaman Deposit (Belum dicustom)</div>
          </PrivateRoute>
        } />
        
        <Route path="/order" element={
          <PrivateRoute>
             <div className="p-5">Halaman Order (Belum dicustom)</div>
          </PrivateRoute>
        } />

        <Route path="/history" element={
          <PrivateRoute>
             <div className="p-5">Halaman History (Belum dicustom)</div>
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;

