import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          TaskFlow
        </Link>
      </div>
      
      <div className="header-right">
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <Link to="/login" className="nav-link">
          Login
        </Link>
        <Link to="/settings" className="nav-link">
          Settings
        </Link>
        <div className="profile-section">
          <FaUserCircle className="profile-icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;