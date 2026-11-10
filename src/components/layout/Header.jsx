import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import '../css/Header.css'

function navClass({ isActive }) {
  return isActive ? 'site-nav__link site-nav__link--active' : 'site-nav__link'
}

function Header() {
  const { configured, loading, user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="site-header__top">
        <NavLink to="/" className="site-header__brand" end>
          Acting
        </NavLink>

        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to="/" className={navClass} end>
            Home
          </NavLink>
          <NavLink to="/courses" className={navClass}>
            Courses
          </NavLink>
          <NavLink to="/calendar" className={navClass}>
            Calendar
          </NavLink>
        </nav>

        <div className="site-account">
          {!configured ? null : loading ? (
            <span className="site-account__status">Loading…</span>
          ) : user ? (
            <>
              <NavLink to="/dashboard" className={navClass}>
                My area
              </NavLink>
              {isAdmin ? (
                <NavLink to="/admin" className={navClass}>
                  Admin
                </NavLink>
              ) : null}
              <NavLink to="/profile" className={navClass}>
                Profile
              </NavLink>
              <button
                type="button"
                className="button button--small button--ghost"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Log in
              </NavLink>
              <NavLink to="/register" className="button button--small">
                Create account
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
