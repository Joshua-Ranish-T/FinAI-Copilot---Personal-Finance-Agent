import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

// Define props for Sidebar component
interface SidebarProps {
  isOpen: boolean;
}

// Define navigation item type
interface NavItem {
  path: string;
  icon: string;
  label: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  // Define navigation items
  const navItems: NavItem[] = [
    { path: '/', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/transactions', icon: 'fas fa-exchange-alt', label: 'Transactions' },
    { path: '/alerts', icon: 'fas fa-bell', label: 'Alerts' },
    { path: '/chatbot', icon: 'fas fa-robot', label: 'Chatbot' },
    { path: '/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Sidebar header */}
      <div className="sidebar-header">
        <h2>Menu</h2>
      </div>
      
      {/* Navigation items */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <i className={item.icon}></i>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Sidebar footer */}
      <div className="sidebar-footer">
        <div className="sidebar-section">
          <h3>Quick Links</h3>
          <ul className="quick-links">
            <li>
              <a href="#" className="quick-link">
                <i className="fas fa-credit-card"></i>
                <span>Manage Cards</span>
              </a>
            </li>
            <li>
              <a href="#" className="quick-link">
                <i className="fas fa-piggy-bank"></i>
                <span>Budget</span>
              </a>
            </li>
            <li>
              <a href="#" className="quick-link">
                <i className="fas fa-chart-pie"></i>
                <span>Analytics</span>
              </a>
            </li>
          </ul>
        </div>
        
        <div className="sidebar-section">
          <h3>Help & Support</h3>
          <ul className="support-links">
            <li>
              <a href="#" className="support-link">
                <i className="fas fa-question-circle"></i>
                <span>FAQ</span>
              </a>
            </li>
            <li>
              <a href="#" className="support-link">
                <i className="fas fa-headset"></i>
                <span>Contact Us</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};