import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ConfigNotice, Loading } from '../ui/Feedback.jsx'

function RequireAuth({ children }) {
  const { configured, loading, user } = useAuth()
  const location = useLocation()

  if (!configured) return <ConfigNotice />
  if (loading) return <Loading label="Checking your session…" />
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

export default RequireAuth
