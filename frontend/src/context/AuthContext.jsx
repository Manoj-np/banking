import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [email, setEmail] = useState(localStorage.getItem('user_email'));
  const [name, setName] = useState(localStorage.getItem('user_name'));
  const [role, setRole] = useState(localStorage.getItem('user_role'));

  const login = (tokenValue, emailValue, nameValue, roleValue) => {
    localStorage.setItem('jwt_token', tokenValue);
    localStorage.setItem('user_email', emailValue);
    localStorage.setItem('user_name', nameValue);
    localStorage.setItem('user_role', roleValue);
    setToken(tokenValue);
    setEmail(emailValue);
    setName(nameValue);
    setRole(roleValue);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    setToken(null);
    setEmail(null);
    setName(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, name, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
