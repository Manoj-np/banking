import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; 
import './Transfer.css';  
import './Transactions.css'; 

export default function AdminDashboard() {
  const { email: adminEmail } = useAuth();
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [fetching, setFetching] = useState(true);

  const loadAccounts = async () => {
    try {
      const res = await api.getAccounts();
      if (res.success) {
        const otherAccounts = res.data.filter(acc => acc.user.email !== adminEmail);
        setAccounts(otherAccounts);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [adminEmail]);

  const handleAction = async (action) => {
    setError('');
    setSuccess('');
    
    if (!accountNumber || !amount) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (action === 'deposit') {
        res = await api.deposit(accountNumber, parseFloat(amount), description);
      } else {
        res = await api.withdraw(accountNumber, parseFloat(amount), description);
      }

      if (res.success) {
        setSuccess(`${action.charAt(0).toUpperCase() + action.slice(1)} successful for ${accountNumber}!`);
        setAccountNumber('');
        setAmount('');
        setDescription('');
        loadAccounts(); 
      }
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = (acc) => {
    setAccountNumber(acc.accountNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-container animate-fade">
      <div className="dashboard-header">
        <div className="welcome-box">
          <h1 className="welcome-title">Administrative <span className="gradient-text">Control Panel</span></h1>
          <p className="welcome-subtitle">Oversee all Paperless Bank digital ecosystems and manage fluid capital.</p>
        </div>
        <div className="account-tag">
          <span className="tag-icon">🛡️</span> Officer Access
        </div>
      </div>

      <div className="transfer-layout">
        <div className="transfer-card glass-panel">
          <h2 className="section-title">Process Asset Flow</h2>
          
          {error && <div className="alert alert-error"><span>{error}</span></div>}
          {success && <div className="alert alert-success"><span>{success}</span></div>}

          <div className="form-group">
            <label className="form-label">Target Digital ID</label>
            <div className="input-wrapper">
              <span className="input-icon">🏦</span>
              <input
                type="text"
                className="form-input"
                placeholder="Enter Digital ID or select from below"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Amount (₹)</label>
            <div className="input-wrapper">
              <span className="input-icon">₹</span>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Digital Note</label>
            <div className="input-wrapper">
              <span className="input-icon">📝</span>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Asset Redistribution"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-row" style={{ marginTop: '24px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => handleAction('deposit')}
              disabled={loading}
              style={{ width: '100%' }}
            >
              Confirm Deposit
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => handleAction('withdraw')}
              disabled={loading}
              style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
            >
              Confirm Withdrawal
            </button>
          </div>
        </div>

        <div className="transfer-info">
          <div className="info-card glass-panel">
            <h3>Officer Quick-Actions</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Selecting a client from the synchronized ledger below will automatically populate the Digital ID for verification.
            </p>
            <div className="stats-box" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>{accounts.length}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' }}>Active Ecosystems</div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '1.5rem', fontStyle: 'italic' }}>
              Reminder: Internal self-funding is strictly prohibited by digital banking protocols.
            </p>
          </div>
        </div>
      </div>

      <div className="ledger-section glass-panel" style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">Client Asset Registry</h2>
            <span className="section-subtitle">Real-time synchronization of all paperless accounts</span>
          </div>
          <button className="view-more-btn" onClick={loadAccounts} disabled={fetching} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {fetching ? 'Syncing...' : '↻ Refresh Registry'}
          </button>
        </div>

        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Account Holder</th>
                <th>Digital ID</th>
                <th>Available Balance</th>
                <th>Management</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Establishing secure connection to registry...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No client ecosystems found in the registry.</td></tr>
              ) : (
                accounts.map(acc => (
                  <tr key={acc.id}>
                    <td>
                      <div className="ledger-details">
                        <span className="ledger-party">{acc.user.name}</span>
                        <span className="ledger-desc">{acc.user.email}</span>
                      </div>
                    </td>
                    <td><code className="account-label">{acc.accountNumber}</code></td>
                    <td><span className="ledger-amount positive">₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></td>
                    <td>
                      <button className="btn btn-outline" onClick={() => selectAccount(acc)} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                        Manage Asset
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
