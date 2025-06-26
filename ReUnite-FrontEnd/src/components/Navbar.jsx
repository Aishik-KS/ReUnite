import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import logo from "../assets/ReUnite_Logo.png";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";

import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-logo-container" onClick={() => navigate("/")}>
        <img src={logo} alt="ReUnite Logo" className="navbar-logo" />
        <span className="navbar-logo-text">ReUnite</span>
      </div>

      <div className="navbar-toggle" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <nav className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <NavLink
          to="/SubmitPage"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={closeMenu}
        >
          Report Found Item
        </NavLink>
        <NavLink
          to="/SearchPage"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={closeMenu}
        >
          Search Lost Items
        </NavLink>
        <NavLink
          to="/Notify"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={closeMenu}
        >
          Apply for Notify
        </NavLink>
        <NavLink
          to="/faq"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={closeMenu}
        >
          FAQ
        </NavLink>
        <NavLink
          to="/AdminLogin"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={closeMenu}
        >
          <FaUser />
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
