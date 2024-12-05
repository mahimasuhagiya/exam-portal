import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import { Col, Container, Row } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Register from './components/Register';
import ViewUsers from './components/ViewUsers';

function App() {
  const isLoggedIn = localStorage.getItem("userId") !== null;

  return (
    <Router>
      <Row>
      <Header /></Row>
      <Container fluid>
        {isLoggedIn ? (
          <Row>
            
              <Sidebar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/register" element={<Register />} />
                <Route path="/viewusers" element={<ViewUsers />} />
              </Routes>
          </Row>
        ) : (
          <div>
            <Home/>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
          </div>
        )}
      </Container>
    </Router>
  );
}

export default App;
