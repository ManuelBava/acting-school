import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  ConfigNotice,
  ErrorNotice,
  Loading,
  Notice,
} from '../components/ui/Feedback.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../lib/errors.js'
import { supabase } from '../lib/supabase.js'

function Register() {
  const { configured, loading, user } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!fullName.trim()) {
      setError('Please enter your name.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('The two passwords do not match.')
      return
    }

    setBusy(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      })
      if (signUpError) throw signUpError

      if (data.session) {
        navigate('/dashboard', { replace: true })
        return
      }

      setNotice(
        'Account created. Check your inbox and confirm your email address, then log in.',
      )
      setPassword('')
      setConfirmPassword('')
    } catch (signUpError) {
      setError(getErrorMessage(signUpError))
    } finally {
      setBusy(false)
    }
  }

  if (!configured) return <ConfigNotice />
  if (loading) return <Loading label="Checking your session…" />
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="page page--narrow">
      <header className="page__header">
        <h1 className="page__title">Create account</h1>
        <p className="page__intro">
          Your name, email, and password are all you need to enroll in a
          course. Your profile is created automatically.
        </p>
      </header>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <ErrorNotice>{error}</ErrorNotice>
        <Notice>{notice}</Notice>

        <div className="field">
          <label className="field__label" htmlFor="register-name">
            Full name
          </label>
          <input
            className="field__input"
            id="register-name"
            type="text"
            name="name"
            autoComplete="name"
            maxLength={120}
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="register-email">
            Email
          </label>
          <input
            className="field__input"
            id="register-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="register-password">
            Password
          </label>
          <input
            className="field__input"
            id="register-password"
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="field__hint">At least 6 characters.</p>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="register-confirm">
            Confirm password
          </label>
          <input
            className="field__input"
            id="register-confirm"
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            minLength={6}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        <button className="button" type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="form-footer">
        Already have an account?{' '}
        <Link className="text-link" to="/login">
          Log in
        </Link>
      </p>
    </div>
  )
}

export default Register
