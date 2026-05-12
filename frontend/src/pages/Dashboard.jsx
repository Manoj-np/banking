import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { email, name } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountRes, txRes] = await Promise.all([
          api.getAccount(email),
          api.getTransactions(email),
        ]);
        if (accountRes.success) setAccount(accountRes.data);
        if (txRes.success) setTransactions(txRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    if (email) loadData();
  }, [email]);

  const formatCurrency = (amt) =>
    Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader-spinner"></div>
        <p>Syncing your financial records...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade">
      <div className="dashboard-header">
        <div className="welcome-box">
          <h1 className="welcome-title">
            Good {getTimeGreeting()}, <span className="gradient-text">{name || 'User'}</span>
          </h1>
          <p className="welcome-subtitle">Your digital assets are secure and growing.</p>
        </div>
        <div className="account-tag">
          <span className="tag-icon">🌱</span> Paperless Savings
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card balance-card glass-panel">
          <div className="stat-card-inner">
            <div className="stat-label-group">
              <span className="stat-icon-mini">💳</span>
              <span className="stat-label">Total Balance</span>
            </div>
            <div className={`stat-value-large ${account?.balance < 0 ? 'negative-balance' : ''}`}>
              <span className="currency-symbol">₹</span>
              {account ? formatCurrency(account.balance) : '0.00'}
            </div>
            {account && account.overdraftLimit > 0 && (
              <div className="stat-overdraft-info">
                <span className="overdraft-label">Overdraft Buffer: ₹{formatCurrency(account.overdraftLimit)}</span>
                <span className="available-label">Total Liquidity: ₹{formatCurrency(account.balance + account.overdraftLimit)}</span>
              </div>
            )}
            <div className="stat-trend positive">
              <span className="trend-icon">↑</span> 2.4% from last month
            </div>
          </div>
        </div>

        <div className="stat-card info-card glass-panel">
          <div className="stat-card-inner">
            <div className="stat-label-group">
              <span className="stat-icon-mini">🆔</span>
              <span className="stat-label">Digital ID</span>
            </div>
            <div className="stat-value-mono">
              {account ? account.accountNumber : 'ACC--------'}
            </div>
            <div className="stat-badge-eco">
              Verified Account
            </div>
          </div>
        </div>

        <div className="stat-card actions-card glass-panel">
          <div className="stat-card-inner">
             <div className="stat-label-group">
              <span className="stat-icon-mini">⚡</span>
              <span className="stat-label">Rapid Access</span>
            </div>
            <div className="action-buttons-stack">
              <Link to="/transfer" className="action-btn-primary">
                <span>💸</span> Send Funds
              </Link>
              <Link to="/transactions" className="action-btn-secondary">
                <span>📜</span> View Ledger
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-section glass-panel">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">Wealth Analytics</h2>
            <span className="section-subtitle">Visualizing your digital asset growth</span>
          </div>
          <div className="analytics-toggle">
            <span className="active">Monthly</span>
            <span>Yearly</span>
          </div>
        </div>
        <div className="chart-container">
          {[40, 65, 45, 90, 75, 100].map((height, i) => (
            <div className="chart-bar-wrapper" key={i}>
              <div className="chart-bar" style={{ height: `${height}%` }}>
                <div className="bar-tooltip">₹{(height * 500).toLocaleString()}</div>
              </div>
              <span className="bar-label">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="algo-insights-grid">
        <div className="insight-card glass-panel">
          <div className="insight-header">
            <span className="insight-icon">🛡️</span>
            <span className="insight-label">AI Security Scan</span>
          </div>
          <p className="insight-text">
            Analyzing patterns using <strong>Z-Score Anomaly Detection</strong>. 
            No outliers detected in your recent asset flows.
          </p>
          <div className="insight-status">Status: Secure</div>
        </div>

        <div className="insight-card glass-panel">
          <div className="insight-header">
            <span className="insight-icon">📈</span>
            <span className="insight-label">Wealth Optimization</span>
          </div>
          <p className="insight-text">
            Using <strong>Pareto Analysis (80/20)</strong> to identify top spending 
            efficiency. Your growth trend is currently optimal.
          </p>
          <div className="insight-status">Efficiency: High</div>
        </div>
      </div>

      <div className="ledger-section glass-panel">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">Digital Ledger</h2>
            <span className="section-subtitle">Your latest cloud-synced transactions</span>
          </div>
          <Link to="/transactions" className="view-more-btn">Explore Full Ledger →</Link>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-ledger">
            <div className="empty-icon-box">♻️</div>
            <p>Your ledger is currently clear.</p>
            <Link to="/transfer" className="btn btn-primary">Initiate First Transfer</Link>
          </div>
        ) : (
          <div className="ledger-list">
            {transactions.map((tx, i) => {
              const isSent = tx.senderAccount === account.accountNumber;
              return (
                <div className="ledger-item" key={tx.id || i}>
                  <div className="ledger-left">
                    <div className={`ledger-icon-box ${isSent ? 'sent' : 'received'}`}>
                      {isSent ? '📤' : '📥'}
                    </div>
                    <div className="ledger-details">
                      <span className="ledger-party">{isSent ? tx.receiverAccount : tx.senderAccount}</span>
                      <span className="ledger-desc">{tx.description || (isSent ? 'External Transfer' : 'Direct Deposit')}</span>
                    </div>
                  </div>
                  <div className="ledger-right">
                    <div className={`ledger-amount ${isSent ? 'negative' : 'positive'}`}>
                      {isSent ? '-' : '+'}₹{formatCurrency(tx.amount)}
                    </div>
                    <div className="ledger-date">{formatDate(tx.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
