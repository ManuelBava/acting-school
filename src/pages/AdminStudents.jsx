import { useEffect, useState } from 'react'
import AdminNav from '../components/admin/AdminNav.jsx'
import {
  EmptyState,
  ErrorNotice,
  Loading,
} from '../components/ui/Feedback.jsx'
import { fetchAllProfiles } from '../lib/data.js'
import { getErrorMessage } from '../lib/errors.js'
import { formatDateTime } from '../lib/format.js'

function AdminStudents() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    fetchAllProfiles()
      .then((data) => {
        if (active) setProfiles(data)
      })
      .catch((loadError) => {
        if (active) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Students</h1>
        <p className="page__intro">
          Profiles are read-only in the admin interface. Students can change
          their own name from their profile page.
        </p>
      </header>

      <AdminNav />
      <ErrorNotice>{error}</ErrorNotice>
      {loading ? <Loading label="Loading profiles…" /> : null}

      {!loading && !error && profiles.length === 0 ? (
        <EmptyState title="No profiles yet">
          Profiles are created automatically when a user registers.
        </EmptyState>
      ) : null}

      {profiles.length > 0 ? (
        <div className="table-wrapper">
          <table className="data-table">
            <caption className="visually-hidden">
              Registered profiles
            </caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Profile created</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td>{profile.full_name?.trim() || 'Unnamed profile'}</td>
                  <td>{formatDateTime(profile.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

export default AdminStudents
