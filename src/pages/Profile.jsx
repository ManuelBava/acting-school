import { useEffect, useState } from 'react'
import {
  ErrorNotice,
  Loading,
  Notice,
} from '../components/ui/Feedback.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { updateProfileName } from '../lib/data.js'
import { getErrorMessage } from '../lib/errors.js'
import { formatDateTime } from '../lib/format.js'

function Profile() {
  const { user, profile, profileLoading, reloadProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
  }, [profile?.full_name])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    const trimmed = fullName.trim()
    if (!trimmed) {
      setError('Please enter your name.')
      return
    }

    setBusy(true)
    try {
      await updateProfileName(user.id, trimmed)
      reloadProfile()
      setNotice('Your name has been updated.')
    } catch (updateError) {
      setError(getErrorMessage(updateError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page page--narrow">
      <header className="page__header">
        <h1 className="page__title">Profile</h1>
        <p className="page__intro">
          Review your account details and update the name shown to the school.
        </p>
      </header>

      <dl className="details-list">
        <div className="details-list__row">
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="details-list__row">
          <dt>Profile created</dt>
          <dd>
            {profile?.created_at ? formatDateTime(profile.created_at) : '—'}
          </dd>
        </div>
      </dl>

      {profileLoading ? <Loading label="Loading your profile…" /> : null}
      <ErrorNotice>{error}</ErrorNotice>
      <Notice>{notice}</Notice>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="profile-name">
            Full name
          </label>
          <input
            className="field__input"
            id="profile-name"
            type="text"
            name="name"
            autoComplete="name"
            maxLength={120}
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
          <p className="field__hint">
            This is the only profile field you can change.
          </p>
        </div>

        <button className="button" type="submit" disabled={busy || profileLoading}>
          {busy ? 'Saving…' : 'Save name'}
        </button>
      </form>
    </div>
  )
}

export default Profile
