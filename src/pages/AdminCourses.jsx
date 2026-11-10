import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminNav from '../components/admin/AdminNav.jsx'
import {
  EmptyState,
  ErrorNotice,
  Loading,
  Notice,
} from '../components/ui/Feedback.jsx'
import { fetchAllCourses, updateCourse } from '../lib/data.js'
import { getErrorMessage } from '../lib/errors.js'
import { formatDateRange } from '../lib/format.js'

function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

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

  async function togglePublished(course) {
    setBusyId(course.id)
    setError('')
    setNotice('')

    try {
      const updated = await updateCourse(course.id, {
        is_published: !course.is_published,
      })
      setCourses((current) =>
        current.map((row) => (row.id === course.id ? updated : row)),
      )
      setNotice(
        updated.is_published
          ? `“${updated.title}” is now published.`
          : `“${updated.title}” was removed from the public catalog.`,
      )
    } catch (updateError) {
      setError(getErrorMessage(updateError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Courses</h1>
        <p className="page__intro">
          Every course is a scheduled edition. Unpublishing hides it from the
          public catalog without deleting the course or its enrollments.
        </p>
      </header>

      <AdminNav />
      <p className="inline-links">
        <Link className="button" to="/admin/courses/new">
          Create a course
        </Link>
      </p>

      <ErrorNotice>{error}</ErrorNotice>
      <Notice>{notice}</Notice>
      {loading ? <Loading label="Loading courses…" /> : null}

      {!loading && !error && courses.length === 0 ? (
        <EmptyState title="No courses yet">
          Create the first course to start building the catalog.
        </EmptyState>
      ) : null}

      <div className="stack">
        {courses.map((course) => (
          <article className="admin-course" key={course.id}>
            <div className="admin-course__main">
              <div className="admin-course__header">
                <h2 className="admin-course__title">
                  <Link to={`/admin/courses/${course.id}`}>
                    {course.title}
                  </Link>
                </h2>
                {course.is_published ? (
                  <span className="badge">Published</span>
                ) : (
                  <span className="badge badge--muted">Not published</span>
                )}
              </div>
              <p className="admin-list__meta">
                {formatDateRange(course.starts_on, course.ends_on)} · capacity{' '}
                {course.capacity}
              </p>
            </div>

            <div className="admin-course__actions">
              <Link
                className="button button--small button--ghost"
                to={`/admin/courses/${course.id}`}
              >
                Edit
              </Link>
              <button
                type="button"
                className="button button--small"
                onClick={() => togglePublished(course)}
                disabled={busyId === course.id}
              >
                {busyId === course.id
                  ? 'Saving…'
                  : course.is_published
                    ? 'Unpublish'
                    : 'Publish'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default AdminCourses
