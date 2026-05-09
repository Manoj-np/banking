import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transfer from './pages/Transfer'
import Transactions from './pages/Transactions'
import AdminDashboard from './pages/AdminDashboard'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { token, role } = useAuth();
  if (token) {
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transactions" element={<Transactions />} />
        </Route>

        <Route element={<AdminRoute><Layout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
