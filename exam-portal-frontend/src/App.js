import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import { Container } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Register from './components/Register';
import ViewUsers from './components/ViewUsers';
function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/viewusers" element={<ViewUsers />} />
    </Routes>
  </Router>
  );
}

export default App;