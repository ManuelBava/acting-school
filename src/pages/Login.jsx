import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  ConfigNotice,
  ErrorNotice,
  Loading,
} from '../components/ui/Feedback.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../lib/errors.js'
import { supabase } from '../lib/supabase.js'

function Login() {
  const { configured, loading, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from =
    typeof location.state?.from === 'string' &&
    location.state.from.startsWith('/')
      ? location.state.from
      : '/dashboard'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) throw signInError
      navigate(from, { replace: true })
    } catch (signInError) {
      setError(getErrorMessage(signInError))
    } finally {
      setBusy(false)
    }
  }

  if (!configured) return <ConfigNotice />
  if (loading) return <Loading label="Checking your session…" />
  if (user) return <Navigate to={from} replace />

  return (
    <div className="page page--narrow">
      <header className="page__header">
        <h1 className="page__title">Log in</h1>
        <p className="page__intro">
          Sign in to manage your enrollments and access your courses.
        </p>
      </header>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <ErrorNotice>{error}</ErrorNotice>

        <div className="field">
          <label className="field__label" htmlFor="login-email">
            Email
          </label>
          <input
            className="field__input"
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="login-password">
            Password
          </label>
          <input
            className="field__input"
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button className="button" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Log in'}
        </button>
      </form>

      <p className="form-footer">
        No account yet?{' '}
        <Link className="text-link" to="/register">
          Create one
        </Link>
      </p>
    </div>
  )
}

export default Login
