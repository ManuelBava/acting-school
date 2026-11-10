import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ConfigNotice, Loading } from '../ui/Feedback.jsx'

function RequireAdmin({ children }) {
  const { configured, loading, adminLoading, user, isAdmin } = useAuth()
  const location = useLocation()

  if (!configured) return <ConfigNotice />
  if (loading || adminLoading) {
    return <Loading label="Checking your permissions…" />
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (!isAdmin) {
    return (
      <section className="page page--narrow">
        <h1 className="page__title">Admin area</h1>
        <div className="feedback feedback--error" role="alert">
          <p className="feedback__title">Access denied</p>
          <p>This account does not have admin permissions.</p>
        </div>
        <p>
          <Link className="text-link" to="/dashboard">
            Go to your dashboard
          </Link>
        </p>
      </section>
    )
  }

  return children
}

export default RequireAdmin
