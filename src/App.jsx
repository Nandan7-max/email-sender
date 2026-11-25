import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Agent from './pages/Agent.jsx';
import Blog from './pages/Blog.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';

export default function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} MailPilot · Powered by Google ADK, Mailjet, and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
