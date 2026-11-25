import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Moon, Sun } from 'lucide-react';

export default function Navbar({ theme, toggleTheme }) {
  return (
    <header className="header">
      <div className="container header-container">
        <NavLink to="/" className="brand-logo">
          <Mail size={22} color="var(--purple-accent)" />
          <span>MailPilot</span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/agent" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Agent
          </NavLink>
          <NavLink to="/blog" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Blog
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Contact
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            About
          </NavLink>

          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
