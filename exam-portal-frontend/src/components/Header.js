import React from "react";
import { NavLink } from "react-router-dom";
import { Col, Container, Row } from 'reactstrap';
import logo from '../logo.png'; 
import '../css/header.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import "../css/sidebar.css";

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = (localStorage.getItem("userId") !== "null" && localStorage.getItem("userId") !== null)? true:false;


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    //navigate('/');
       // window.location.reload();
       window.location.href = '/';
};
  return (
    <header className="exam-portal-header">
      <Container fluid>
      <Row>
        <Col lg={3}>{isLoggedIn ? <Sidebar/>:<></>}</Col>
        <Col   lg={6} className="d-flex justify-content-center"> 
          <div className="header-logo"><img src={logo} alt="Exam Portal Logo" /></div>
        </Col>
        <Col lg={3} className="d-flex justify-content-end">
          {isLoggedIn ?
          <nav className="header-nav">
            <ul>
              <li><NavLink onClick={handleLogout}>Logout</NavLink></li>
            </ul>
          </nav>: <></>}
        </Col>
      </Row>
    </Container>
  </header>
  );
};

export default Header;