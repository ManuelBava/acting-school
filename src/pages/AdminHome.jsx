import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminNav from '../components/admin/AdminNav.jsx'
import {
  EmptyState,
  ErrorNotice,
  Loading,
} from '../components/ui/Feedback.jsx'
import { fetchAllCourses } from '../lib/data.js'
import { getErrorMessage } from '../lib/errors.js'
import { formatDateRange } from '../lib/format.js'

function AdminHome() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    fetchAllCourses()
      .then((data) => {
        if (active) setCourses(data)
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

  const published = courses.filter((course) => course.is_published).length
  const drafts = courses.length - published
  const recent = courses.slice(0, 5)

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Admin</h1>
        <p className="page__intro">
          Manage courses, lessons, and enrollments. Admin access is verified by
          the database on every request.
        </p>
      </header>

      <AdminNav />
      <ErrorNotice>{error}</ErrorNotice>
      {loading ? <Loading label="Loading the admin overview…" /> : null}

      <div className="stats-grid">
        <div className="stat">
          <p className="stat__value">{courses.length}</p>
          <p className="stat__label">Courses</p>
        </div>
        <div className="stat">
          <p className="stat__value">{published}</p>
          <p className="stat__label">Published</p>
        </div>
        <div className="stat">
          <p className="stat__value">{drafts}</p>
          <p className="stat__label">Not published</p>
        </div>
      </div>

      <section className="panel" aria-labelledby="recent-title">
        <h2 className="panel__title" id="recent-title">
          Recent courses
        </h2>

        {!loading && !error && recent.length === 0 ? (
          <EmptyState title="No courses yet">
            Create the first course to start building the catalog.
          </EmptyState>
        ) : null}

        {recent.length > 0 ? (
          <ul className="admin-list">
            {recent.map((course) => (
              <li className="admin-list__item" key={course.id}>
                <div>
                  <p className="admin-list__title">
                    <Link to={`/admin/courses/${course.id}`}>
                      {course.title}
                    </Link>
                  </p>
                  <p className="admin-list__meta">
                    {formatDateRange(course.starts_on, course.ends_on)}
                  </p>
                </div>
                <div className="admin-list__actions">
                  {course.is_published ? (
                    <span className="badge">Published</span>
                  ) : (
                    <span className="badge badge--muted">Not published</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="inline-links">
        <Link className="button" to="/admin/courses/new">
          Create a course
        </Link>
        <Link className="button button--ghost" to="/admin/students">
          View students
        </Link>
      </p>
    </div>
  )
}

export default AdminHome
