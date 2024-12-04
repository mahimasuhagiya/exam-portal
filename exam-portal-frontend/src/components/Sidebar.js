import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div style={{ width: '250px', background: '#f4f4f4', height: '100vh' }}>
      <Nav vertical>
        <NavItem>
          <NavLink tag={Link} to="/">Dashboard</NavLink>
          <NavLink tag={Link} to="/register">register</NavLink>
          <NavLink tag={Link} to="/login">login</NavLink>
          <NavLink tag={Link} to="/viewusers">viewusers</NavLink>
        </NavItem>
      </Nav>
    </div>
  );
};

export default Sidebar;