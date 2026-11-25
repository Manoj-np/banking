import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Auth.css';

const DEMO_ACCOUNTS = [
  {
    key: 'client',
    label: 'Fill Client',
    meta: 'Alex Green',
    email: 'alex@paperless.com',
    password: 'user123',
    details: 'Transfer PIN: 1234 · Test recipient: PLB-SARA-01',
  },
  {
    key: 'admin',
    label: 'Fill Admin',
    meta: 'System Admin',
    email: 'admin@nexus.com',
    password: 'admin123',
    details: 'Admin Panel access · PIN: 0000',
  },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setSelectedDemo(demo);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await api.login(email, password);
      if (result.success && result.data) {
        login(result.data.token, result.data.email, result.data.name, result.data.role);
        setSuccess('Login successful! Redirecting...');
        const target = result.data.role === 'ADMIN' ? '/admin' : '/dashboard';
        setTimeout(() => navigate(target), 600);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span>🌿</span>
            </div>
            <h1>Paperless<span className="gradient-text">Bank</span></h1>
            <p className="auth-subtitle">Secure access to your digital ecosystem</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-loader">⟳</span> : 'Sign In'}
            </button>
          </form>

          <div className="demo-card" aria-label="Demo Credentials">
            <div className="demo-card-header">
              <span className="demo-card-title">Demo Credentials</span>
              <span className="demo-card-badge">1-Click Fill</span>
            </div>
            <div className="demo-actions">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.key}
                  type="button"
                  className={`demo-fill-btn ${selectedDemo?.key === demo.key ? 'active' : ''}`}
                  onClick={() => handleFillDemo(demo)}
                >
                  <span className="demo-fill-label">{demo.label}</span>
                  <span className="demo-fill-meta">{demo.meta}</span>
                </button>
              ))}
            </div>
            <p className="demo-card-hint">
              {selectedDemo
                ? `${selectedDemo.email} filled · ${selectedDemo.details}`
                : 'Select a role above to auto-fill credentials and click Sign In.'}
            </p>
          </div>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
          </div>
        </div>

        <div className="auth-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
}
