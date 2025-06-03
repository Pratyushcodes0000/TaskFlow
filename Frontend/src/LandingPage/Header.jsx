import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user data in localStorage
    const storedUser = localStorage.getItem('user');
    console.log('Stored user data:', storedUser); // Debug log

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user data:', parsedUser); // Debug log
        
        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
          console.log('User picture URL:', parsedUser.picture); // Debug log
        } else {
          console.warn('Invalid user data format'); // Debug log
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          TaskFlow
        </Link>
      </div>
      
      <div className="header-right">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/settings" className="nav-link">
              Settings
            </Link>
            <div className="profile-section">
              {user.picture ? (
                <div className="profile-container">
                  <img 
                    src={user.picture} 
                    alt={user.name || 'User'} 
                    className="profile-picture"
                    onError={(e) => {
                      console.error('Error loading profile picture:', e);
                      e.target.src = ''; // Clear the src
                      e.target.style.display = 'none'; // Hide the image
                    }}
                  />
                  <div className="profile-dropdown">
                    <div className="profile-info">
                      <span className="profile-name">{user.name || 'User'}</span>
                      <span className="profile-email">{user.email}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-container">
                  <FaUserCircle className="profile-icon" />
                  <div className="profile-dropdown">
                    <div className="profile-info">
                      <span className="profile-name">{user.name || 'User'}</span>
                      <span className="profile-email">{user.email}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <div className="profile-section">
              <FaUserCircle className="profile-icon" />
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;