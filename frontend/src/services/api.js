const API_BASE = '';

async function request(endpoint, options = {}) {
  const url = API_BASE + endpoint;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('jwt_token');
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password, pin) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, pin }),
    }),

  getAccount: (email) =>
    request('/api/auth/account/' + encodeURIComponent(email)),

  transfer: (senderAccountNumber, receiverAccountNumber, amount, description, pin) =>
    request('/api/auth/transfer', {
      method: 'POST',
      body: JSON.stringify({ senderAccountNumber, receiverAccountNumber, amount, description, pin }),
    }),

  getTransactions: (email) =>
    request('/api/auth/transactions/' + encodeURIComponent(email)),

  test: () => request('/api/auth/test'),

  // Admin methods
  deposit: (accountNumber, amount, description) =>
    request('/api/admin/deposit', {
      method: 'POST',
      body: JSON.stringify({ accountNumber, amount, description }),
    }),

  withdraw: (accountNumber, amount, description) =>
    request('/api/admin/withdraw', {
      method: 'POST',
      body: JSON.stringify({ accountNumber, amount, description }),
    }),

  getAccounts: () => request('/api/admin/accounts'),
};
