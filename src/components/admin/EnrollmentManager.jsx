import { useState } from 'react'
import { createEnrollment, deleteEnrollment } from '../../lib/data.js'
import { getErrorMessage } from '../../lib/errors.js'
import { formatDateTime } from '../../lib/format.js'
import ConfirmAction from '../ui/ConfirmAction.jsx'
import { EmptyState, ErrorNotice, Notice } from '../ui/Feedback.jsx'

function displayName(profile) {
  return profile?.full_name?.trim() || 'Unnamed profile'
}

function EnrollmentManager({
  courseId,
  capacity,
  enrollments,
  profiles,
  onChanged,
}) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [busy, setBusy] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const enrolledIds = new Set(enrollments.map((row) => row.user_id))
  const availableProfiles = profiles.filter(
    (profile) => !enrolledIds.has(profile.id),
  )

  async function handleAdd(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!selectedUserId) {
      setError('Please select a student.')
      return
    }

    setBusy(true)
    try {
      await createEnrollment(selectedUserId, courseId)
      setSelectedUserId('')
      setNotice('Student enrolled.')
      await onChanged()
    } catch (addError) {
      setError(getErrorMessage(addError))
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(enrollment) {
    setBusyId(enrollment.id)
    setError('')
    setNotice('')

    try {
      await deleteEnrollment(enrollment.id)
      setNotice('Enrollment removed.')
      await onChanged()
    } catch (removeError) {
      setError(getErrorMessage(removeError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="panel" aria-labelledby="enrollments-title">
      <h2 className="panel__title" id="enrollments-title">
        Enrolled students
      </h2>
      <p className="panel__text">
        {enrollments.length} of {capacity} places taken. Admins can enroll or
        remove students at any time; capacity always applies.
      </p>

      <ErrorNotice>{error}</ErrorNotice>
      <Notice>{notice}</Notice>

      {enrollments.length === 0 ? (
        <EmptyState title="No students enrolled yet">
          Enroll a student manually or wait for the first public enrollment.
        </EmptyState>
      ) : (
        <ul className="admin-list">
          {enrollments.map((enrollment) => (
            <li className="admin-list__item" key={enrollment.id}>
              <div>
                <p className="admin-list__title">
                  {displayName(enrollment.profiles)}
                </p>
                <p className="admin-list__meta">
                  Enrolled on {formatDateTime(enrollment.created_at)}
                </p>
              </div>
              <div className="admin-list__actions">
                <ConfirmAction
                  label="Remove"
                  confirmLabel="Remove enrollment"
                  cancelLabel="Keep it"
                  question="Remove this enrollment?"
                  busy={busyId === enrollment.id}
                  onConfirm={() => handleRemove(enrollment)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="form form--compact" onSubmit={handleAdd}>
        <div className="field">
          <label className="field__label" htmlFor="enroll-student">
            Enroll a student
          </label>
          <select
            className="field__input"
            id="enroll-student"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            disabled={busy || availableProfiles.length === 0}
          >
            <option value="">
              {availableProfiles.length === 0
                ? 'All registered profiles are enrolled'
                : 'Select a profile'}
            </option>
            {availableProfiles.map((profile) => (
              <option value={profile.id} key={profile.id}>
                {displayName(profile)}
              </option>
            ))}
          </select>
        </div>

        <button
          className="button button--small"
          type="submit"
          disabled={busy || availableProfiles.length === 0}
        >
          {busy ? 'Enrolling…' : 'Enroll student'}
        </button>
      </form>
    </section>
  )
}

export default EnrollmentManager
