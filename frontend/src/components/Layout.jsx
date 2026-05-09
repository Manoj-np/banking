import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { name, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = role === 'ADMIN';

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-container">
          <a href="/" className="nav-logo" onClick={e => { e.preventDefault(); navigate(isAdmin ? '/admin' : '/dashboard'); }}>
            <span className="logo-icon">🌿</span>
            <span className="logo-text">Paperless<span className="gradient-text">Bank</span></span>
          </a>
          <div className="nav-links">
            {isAdmin ? (
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">🛡️</span> Control Panel
              </NavLink>
            ) : (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">📊</span> Overview
                </NavLink>
                <NavLink to="/transfer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">💸</span> Transfer
                </NavLink>
                <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">📜</span> Ledger
                </NavLink>
              </>
            )}
          </div>
          <div className="nav-right">
            <div className="user-profile">
              {isAdmin && <span className="admin-badge">Officer</span>}
              <div className="user-info-text">
                <span className="user-greeting">Welcome back,</span>
                <span className="user-name-display">{name || 'User'}</span>
              </div>
            </div>
            <button className="btn-logout-minimal" onClick={handleLogout} title="Sign Out">
              <span>🚪</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2026 Paperless Bank. <span className="gradient-text">Pure Digital. Pure Green.</span></p>
        </div>
      </footer>
    </div>
  );
}
