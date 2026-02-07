import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Deposit from './pages/Deposit'; 
import History from './pages/History';
import Welcome from './pages/Welcome'; 
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <Navbar /> 
      
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Welcome />} />

          <Route path="/login" element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } />
          
          <Route path="/register" element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          } />
          
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

          <Route path="/deposit" element={
            <PrivateRoute>
               <Deposit />
            </PrivateRoute>
          } />
          
          <Route path="/order" element={
            <PrivateRoute>
               <div className="p-5">Halaman Order (Belum dicustom)</div>
            </PrivateRoute>
          } />

          <Route path="/history" element={
            <PrivateRoute>
               <History />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


