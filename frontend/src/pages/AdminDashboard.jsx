import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; 
import './Transfer.css';  
import './Transactions.css'; // For table styles

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
        // Filter out the admin's own account so they can't self-fund
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
        loadAccounts(); // Refresh the list
      }
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = (acc) => {
    setAccountNumber(acc.accountNumber);
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1 className="welcome-title">Admin <span className="gradient-text">Control Panel</span></h1>
        <p className="welcome-subtitle">Directly manage funds and oversee all NexusBank user accounts</p>
      </div>

      <div className="transfer-layout">
        <div className="transfer-card">
          <h2 className="section-title">Process Transaction</h2>
          
          {error && <div className="alert alert-error"><span>{error}</span></div>}
          {success && <div className="alert alert-success"><span>{success}</span></div>}

          <div className="form-group">
            <label className="form-label">Account Number</label>
            <div className="input-wrapper">
              <span className="input-icon">🏦</span>
              <input
                type="text"
                className="form-input"
                placeholder="Select from list or enter number"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
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
            <label className="form-label">Description</label>
            <div className="input-wrapper">
              <span className="input-icon">📝</span>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cash Deposit"
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
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
            >
              Deposit Funds
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => handleAction('withdraw')}
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none' }}
            >
              Withdraw Funds
            </button>
          </div>
        </div>

        <div className="transfer-info">
          <div className="info-card">
            <h3>Quick Actions</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Select a user from the table below to automatically fill their account number into the processing form.
            </p>
            <div className="stat-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="stat-card">
                <div className="stat-value">{accounts.length}</div>
                <div className="stat-label">Customer Accounts</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1rem', fontStyle: 'italic' }}>
              Note: You cannot perform financial operations on your own administrative account.
            </p>
          </div>
        </div>
      </div>

      <div className="transactions-section" style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <h2 className="section-title">All Customer Accounts</h2>
          <button className="btn-refresh" onClick={loadAccounts} disabled={fetching}>
            {fetching ? '...' : '↻ Refresh List'}
          </button>
        </div>

        <div className="transactions-card">
          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Account Number</th>
                  <th>Current Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading accounts...</td></tr>
                ) : accounts.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No customer accounts found.</td></tr>
                ) : (
                  accounts.map(acc => (
                    <tr key={acc.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-name">{acc.user.name}</div>
                          <div className="user-email">{acc.user.email}</div>
                        </div>
                      </td>
                      <td><code className="acc-number">{acc.accountNumber}</code></td>
                      <td><span className="amount-positive">₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></td>
                      <td>
                        <button className="btn-select" onClick={() => selectAccount(acc)}>
                          Select
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
    </div>
  );
}
