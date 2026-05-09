import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Transactions.css';

export default function Transactions() {
  const { email } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amt) =>
    Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txRes, accountRes] = await Promise.all([
          api.getTransactions(email),
          api.getAccount(email)
        ]);
        if (txRes.success) setTransactions(txRes.data);
        if (accountRes.success) setAccount(accountRes.data);
      } catch (err) {
        console.error('Failed to load transaction data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (email) loadData();
  }, [email]);

  if (loading) {
    return <div className="loading-state"><div className="loader-spinner"></div><p>Loading transactions...</p></div>;
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1 className="page-title">Transaction History</h1>
        <p className="page-subtitle">View all your past transactions</p>
      </div>

      <div className="section-card">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No transactions found</p>
            <Link to="/transfer" className="btn btn-outline">Make your first transfer</Link>
          </div>
        ) : (
          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Counterparty</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const isSent = account && tx.senderAccount === account.accountNumber;
                  const type = isSent ? 'sent' : 'received';
                  return (
                    <tr key={tx.id || i}>
                      <td>
                        <span className={`type-badge ${type}`}>
                          {isSent ? '↑ Sent' : '↓ Received'}
                        </span>
                      </td>
                      <td>
                        <div className="counterparty-cell">
                          <span className="account-label">{isSent ? tx.receiverAccount : tx.senderAccount}</span>
                          <span className="email-label">{isSent ? tx.receiverEmail : tx.senderEmail}</span>
                        </div>
                      </td>
                      <td className={`transaction-amount ${type}`}>
                        {isSent ? '-' : '+'}₹{formatCurrency(tx.amount)}
                      </td>
                      <td>{tx.description || '—'}</td>
                      <td>{formatDate(tx.createdAt)}</td>
                      <td><span className="status-pill">{tx.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
