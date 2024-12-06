import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "../css/sidebar.css";

const Sidebar = () => {
  const isLoggedIn = (localStorage.getItem("userId") !== "null" && localStorage.getItem("userId") !== null)? true:false;

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="sidebar-container">
      {isLoggedIn?
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
      : <></>
      }
      {isLoggedIn?
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
          <nav className="sidebar-menu">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/viewusers"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Students
            </NavLink>
            <NavLink
              to="colleges"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Colleges
            </NavLink>
            <NavLink
              to="/manage-questions"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Questions
            </NavLink>
            <NavLink
              to="/manage-question-categories"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Question Categories
            </NavLink>
            <NavLink
              to="/manage-exams"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Exams
            </NavLink>
          </nav>
        </div>
      : <></>
      }
    </div>
  );
};

export default Sidebar;
