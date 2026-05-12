import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Transfer.css';

export default function Transfer() {
  const { email } = useAuth();
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amt) =>
    Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const res = await api.getAccount(email);
        if (res.success) setAccount(res.data);
      } catch (err) {
        console.error('Failed to load account details:', err);
      }
    };
    if (email) loadAccount();
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!account) {
      setError('Account details not loaded. Please refresh.');
      return;
    }

    if (receiverAccountNumber === account.accountNumber) {
      setError('Cannot transfer to your own account.');
      return;
    }

    if (pin.length !== 4) {
      setError('Please enter your 4-digit transaction PIN.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);

    try {
      const result = await api.transfer(account.accountNumber, receiverAccountNumber, numAmount, description || null, pin);
      if (result.success) {
        const newBal = result.data?.newBalance;
        let msg = `Transfer of ₹${formatCurrency(numAmount)} was successful!`;
        if (newBal !== null && newBal !== undefined) {
          msg += ` New balance: ₹${formatCurrency(newBal)}`;
          setAccount(prev => ({ ...prev, balance: newBal }));
        }
        setSuccess(msg);
        setReceiverAccountNumber('');
        setAmount('');
        setDescription('');
        setPin('');
      }
    } catch (err) {
      setError(err.message || 'Transfer failed. Please check your PIN and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-page">
      <div className="page-header">
        <h1 className="page-title">Transfer Funds</h1>
        <p className="page-subtitle">Send money securely using Account Numbers & PIN</p>
      </div>

      <div className="transfer-layout">
        <div className="transfer-card">
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
              <label className="form-label">Recipient Account Number</label>
              <div className="input-wrapper">
                <span className="input-icon">🏦</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ACC-XXXXXXXX"
                  value={receiverAccountNumber}
                  onChange={e => setReceiverAccountNumber(e.target.value.toUpperCase())}
                  required
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
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              <span className="form-hint">
                Available: ₹{account ? formatCurrency(account.balance) : '—'} 
                {account && account.overdraftLimit > 0 && ` (Limit: ₹${formatCurrency(account.balance + account.overdraftLimit)})`}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <div className="input-wrapper">
                <span className="input-icon">📝</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What's this for?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction PIN</label>
              <div className="input-wrapper">
                <span className="input-icon">🔢</span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                  maxLength={4}
                  minLength={4}
                />
              </div>
              <span className="form-hint">Required to authorize this transfer</span>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-loader">⟳</span> : 'Confirm & Send Money'}
            </button>
          </form>
        </div>

        <div className="transfer-info">
          <div className="info-card">
            <h3>Security Guidelines</h3>
            <ul className="info-list">
              <li><span className="info-bullet">🔒</span> Your PIN is encrypted and never stored in plain text</li>
              <li><span className="info-bullet">🛡️</span> Never share your transaction PIN with anyone</li>
              <li><span className="info-bullet">🚫</span> Transfers are instant and irreversible once authorized</li>
              <li><span className="info-bullet">●</span> Maximum transfer limit: ₹1,00,000</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
