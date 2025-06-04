import React, { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [loginError, setLoginError] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing user data
    try {
      const storedUser = localStorage.getItem('user');
      console.log('Stored user data:', storedUser);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user data:', parsedUser);
        
        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
          setIsLoggedIn(true);
          console.log('User is already logged in');
        } else {
          console.warn('Invalid stored user data format');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error handling stored user data:', error);
      localStorage.removeItem('user');
    }

    // Load Google OAuth script only if not logged in
    if (!isLoggedIn) {
      const loadGoogleScript = () => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
          console.log('Google Client ID:', clientId);

          if (!clientId) {
            console.error('Google Client ID is missing. Please check your .env file.');
            setLoginError('Google authentication is not properly configured.');
            return;
          }

          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleGoogleLogin,
              auto_select: false,
              cancel_on_tap_outside: true,
              context: 'signin',
              ux_mode: 'popup',
              origin: window.location.origin
            });

            window.google.accounts.id.renderButton(
              document.getElementById('googleButton'),
              { 
                theme: 'outline', 
                size: 'large', 
                width: '100%',
                text: 'continue_with',
                shape: 'rectangular',
                logo_alignment: 'center'
              }
            );
          } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
            setLoginError('Failed to initialize Google Sign-In');
          }
        };

        script.onerror = () => {
          console.error('Failed to load Google Sign-In script');
          setLoginError('Failed to load Google Sign-In');
        };
      };

      loadGoogleScript();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('googleToken');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoginError(null);
      console.log('Google Token received:', credentialResponse.credential ? 'Yes' : 'No');
      
      // Configure axios defaults
      axios.defaults.withCredentials = true;
      
      // Send token to backend
      const res = await axios.post('http://localhost:8000/api/auth/google', 
        { token: credentialResponse.credential },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );
      
      console.log('Server response:', res.data);
      
      if (!res.data || !res.data.user) {
        console.error('Invalid server response:', res.data);
        throw new Error('Invalid response from server');
      }

      const userData = res.data.user;
      console.log("Received user data:", userData);

      // Verify required fields
      if (!userData.name || !userData.email || !userData.picture) {
        console.error('Missing user data fields:', {
          hasName: !!userData.name,
          hasEmail: !!userData.email,
          hasPicture: !!userData.picture
        });
        throw new Error('Missing required user data');
      }

      // Store user data and Google token in localStorage
      try {
        const userDataToStore = {
          name: userData.name,
          email: userData.email,
          picture: userData.picture
        };
        
        console.log("Attempting to store user data:", userDataToStore);
        
        // Clear existing data first
        localStorage.removeItem('user');
        localStorage.removeItem('googleToken');
        
        // Store new data
        localStorage.setItem('user', JSON.stringify(userDataToStore));
        localStorage.setItem('googleToken', credentialResponse.credential);
        
        // Verify storage
        const storedData = localStorage.getItem('user');
        const storedToken = localStorage.getItem('googleToken');
        console.log("Verified stored data:", storedData);
        console.log("Verified stored token:", storedToken ? 'Token stored' : 'No token stored');
        
        if (!storedData || !storedToken) {
          throw new Error('Failed to verify data storage');
        }
        
        setUser(userDataToStore);
        console.log("User state updated successfully");
        
        // Navigate after successful storage
        navigate('/');
      } catch (storageError) {
        console.error('Error storing user data:', storageError);
        setLoginError('Failed to save login information. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'ERR_NETWORK') {
        setLoginError('Cannot connect to the server. Please make sure the server is running.');
      } else {
        setLoginError(error.response?.data?.error || 'Login failed. Please try again.');
      }
    }
  };

  if (isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Welcome Back 👋</h1>
          <div className="logged-in-message">
            <p>You are already logged in as:</p>
            <div className="user-info">
              {user?.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="user-avatar"
                />
              )}
              <div className="user-details">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome Back 👋</h1>
        <p className="subtitle">Please sign in to continue</p>

        {loginError && (
          <div className="error-message">
            {loginError}
          </div>
        )}

        <form className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div id="googleButton"></div>

        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
