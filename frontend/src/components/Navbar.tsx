import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Navbar.css';

// Define props for Navbar component
interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="sidebar-toggle" 
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className="logo">
          <h1>FinAI Copilot</h1>
        </div>
      </div>
      
      <div className="navbar-center">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search transactions, merchants..."
            className="search-input"
          />
          <button className="search-button" aria-label="Search">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>
      
      <div className="navbar-right">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <i className="fas fa-sun"></i>
          ) : (
            <i className="fas fa-moon"></i>
          )}
        </button>
        
        <div className="notifications">
          <button className="notification-button" aria-label="Notifications">
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </button>
        </div>
        
        {user && (
          <div className="user-profile">
            <div className="user-avatar">
              {/* Always show placeholder as fallback */}
              <div className="avatar-placeholder">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              
              {/* Show image on top if available */}
              {user?.avatar && (
                <img 
                  src={user.avatar} 
                  alt={user.name || 'User avatar'} 
                  className="user-avatar-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};