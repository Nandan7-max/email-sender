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
          <a href="#home" className="ag-link">Home</a>
          <a href="#about" className="ag-link">About</a>
          <a href="#sender-agent" className="ag-link">AI Sender</a>
          <a href="#history" className="ag-link">Email History</a>
          <a href="#contact" className="ag-link">Contact</a>
          <NavLink to="/agent" className="ag-link" style={{ color: 'var(--agrica-green)', fontWeight: 700 }}>
            Full Agent App
          </NavLink>
        </nav>

        {/* Right CTA Pill Button matching Agrica style */}
        <div className="agrica-actions">
          <a href="tel:+919063889100" className="agrica-cta-btn" title="Click to call +91 9063889100">
            <PhoneCall size={15} />
            <span>+91 9063889100</span>
          </a>

          <button className="theme-toggle-minimal" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
