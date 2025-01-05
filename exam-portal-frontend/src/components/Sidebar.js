import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "../css/sidebar.css";
import { getWithExpiry } from "../services/authService";

const Sidebar = () => {
  const isLoggedIn = getWithExpiry("userId") !== "null" && getWithExpiry("userId") !== null;

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
              to="colleges"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Colleges
            </NavLink>
            <NavLink
              to="/viewusers"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Students
            </NavLink>
            <NavLink
              to="/difficulty"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Difficulty Levels
            </NavLink>
            <NavLink
              to="/question-categories"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Question Categories
            </NavLink>
            <NavLink
              to="/questions"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Questions
            </NavLink>
            <NavLink
              to="/manageexams"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Manage Exams
            </NavLink>
            <NavLink
              to="/result"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={toggleSidebar}
            >
              Exam Results
            </NavLink>
          </nav>
        </div>
      : <></>
      }
    </div>
  );
};

export default Sidebar;
