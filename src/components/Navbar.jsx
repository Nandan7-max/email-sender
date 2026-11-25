import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, PhoneCall, Moon, Sun, ArrowUpRight } from 'lucide-react';

export default function Navbar({ theme, toggleTheme }) {
  return (
    <header className="agrica-header">
      <div className="agrica-nav-container">
        {/* Brand Logo with Green/Emerald Agri-Tech feel + Mail Icon */}
        <NavLink to="/" className="agrica-brand">
          <div className="brand-icon-box">
            <Mail size={20} color="#ffffff" />
          </div>
          <span className="brand-name">Sendora</span>
        </NavLink>

        {/* Navigation Links */}
        <nav className="agrica-nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'ag-link active' : 'ag-link')}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'ag-link active' : 'ag-link')}>
            About
          </NavLink>
          <NavLink to="/agent" className={({ isActive }) => (isActive ? 'ag-link active' : 'ag-link')}>
            Services
          </NavLink>
          <NavLink to="/blog" className={({ isActive }) => (isActive ? 'ag-link active' : 'ag-link')}>
            Blog
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'ag-link active' : 'ag-link')}>
            Contact
          </NavLink>
        </nav>

        {/* Right CTA Pill Button matching Agrica style */}
        <div className="agrica-actions">
          <NavLink to="/agent" className="agrica-cta-btn">
            <PhoneCall size={15} />
            <span>(10) 892-293 2678</span>
          </NavLink>

          <button className="theme-toggle-minimal" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
