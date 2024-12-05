import React from 'react';
import { Navbar, NavbarBrand } from 'reactstrap';
import logo from '../logo.png'; 
import '../css/header.css';

const Header = () => {
  return (
    // <header className="mesmerizing-header">
    //   <div className="header-content">
    //     <h1 className="header-title">Welcome to My App</h1>
    //     <p className="header-subtitle">A place to explore and grow</p>
    //   </div>
    //   <div className="animated-gradient"></div>
    // </header>
    <header className="exam-portal-header">
    <div className="header-logo">
      <img src={logo} alt="Exam Portal Logo" />
    </div>
    <nav className="header-nav">
      <ul>
        <li><a href="/logout">Logout</a></li>
      </ul>
    </nav>
  </header>
  );
};

export default Header;