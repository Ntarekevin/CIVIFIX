import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="navbar" style={scrolled ? { background: 'rgba(13,17,23,0.97)' } : {}}>
      <Link to="/" className="navbar__logo">
        <span>🛡</span> Civic<span>Fix</span>
      </Link>

      {/* Desktop links */}
      <ul className="navbar__links" style={{ display: menuOpen ? 'none' : undefined }}>
        <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
        <li><NavLink to="/track" className={({ isActive }) => isActive ? 'active' : ''}>Track Report</NavLink></li>
        <li><NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink></li>
        <li><NavLink to="/report" className="navbar__cta">Report Issue</NavLink></li>
      </ul>

      {/* Mobile hamburger */}
      <button
        className="btn btn-secondary btn-sm"
        style={{ marginLeft: 'auto', display: 'none' }}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
        id="hamburger-btn"
      >
        ☰
      </button>
    </nav>
  );
}
