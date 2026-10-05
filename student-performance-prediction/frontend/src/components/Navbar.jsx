import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon">🎓</div>
          <div className="brand-text">
            <span className="brand-title">Student Performance</span>
            <span className="brand-subtitle">Prediction & Analytics</span>
          </div>
        </Link>

        <button 
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>

          <NavLink 
            to="/prediction" 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">🎯</span> Prediction
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">📈</span> Analytics
          </NavLink>

          <NavLink 
            to="/models" 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">🧠</span> Models
          </NavLink>

          <NavLink 
            to="/csv" 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">📁</span> CSV
          </NavLink>

          <NavLink 
            to="/history" 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">🕒</span> History
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
