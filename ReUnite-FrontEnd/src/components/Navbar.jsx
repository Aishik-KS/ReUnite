import React from "react";
import { NavLink, useNavigate } from "react-router";
import logo from "../assets/ReUnite_Logo.png";
import { FaUser } from "react-icons/fa";

import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-logo-container" onClick={() => navigate("/")}>
        <img src={logo} alt="ReUnite Logo" className="navbar-logo" />
        <span className="navbar-logo-text">ReUnite</span>
      </div>

      <nav className="navbar-links">
        <NavLink
          to="/SubmitPage"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Report Found Item
        </NavLink>
        <NavLink
          to="/SearchPage"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Search Lost Items
        </NavLink>
        <NavLink
          to="/Notify"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Apply for Notify
        </NavLink>
        <NavLink
          to="/faq"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          FAQ
        </NavLink>
        <NavLink
          to="/AdminLogin"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <FaUser />
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
