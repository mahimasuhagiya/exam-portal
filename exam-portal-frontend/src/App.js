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
import CollegePage from './components/CollegePage';

function App() {
 // localStorage.setItem("userId",1);
  const isLoggedIn = (localStorage.getItem("userId") !== "null" && localStorage.getItem("userId") !== null)? true:false;

  return (
    <Router>
      <Row>
      <Header /></Row>
      <Container fluid>
        {isLoggedIn ? (
          <Row>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/register" element={<Register />} />
                <Route path="/colleges" element={<CollegePage />} />
                <Route path="/viewusers" element={<ViewUsers />} />
              </Routes>
          </Row>
        ) : (
          <div>
          <Routes>
            <Route path="/" element={<Home />} />
             <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          </div>
        )}
      </Container>
    </Router>
  );
}

export default App;
