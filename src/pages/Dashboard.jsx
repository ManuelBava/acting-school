import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LessonCalendar from '../components/calendar/LessonCalendar.jsx'
import ConfirmAction from '../components/ui/ConfirmAction.jsx'
import {
  EmptyState,
  ErrorNotice,
  Loading,
  Notice,
} from '../components/ui/Feedback.jsx'
import { useAuth } from '../hooks/useAuth.js'
import {
  deleteEnrollment,
  fetchLessonsForCourses,
  fetchMyEnrollments,
} from '../lib/data.js'
import { getErrorMessage } from '../lib/errors.js'
import {
  formatDateRange,
  isBeforeCourseStart,
} from '../lib/format.js'

function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [lessonsByCourse, setLessonsByCourse] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    async function load() {
      const rows = await fetchMyEnrollments(user.id)
      const lessons = await fetchLessonsForCourses(
        rows.map((row) => row.course_id),
      )
      const grouped = {}
      for (const lesson of lessons) {
        if (!grouped[lesson.course_id]) grouped[lesson.course_id] = []
        grouped[lesson.course_id].push(lesson)
      }
      return { rows, grouped }
    }

    load()
      .then(({ rows, grouped }) => {
        if (!active) return
        setEnrollments(rows)
        setLessonsByCourse(grouped)
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
  }, [user.id])

  async function handleCancel(enrollment) {
    setBusyId(enrollment.id)
    setError('')
    setNotice('')

    try {
      await deleteEnrollment(enrollment.id)
      setEnrollments((current) =>
        current.filter((row) => row.id !== enrollment.id),
      )
      setNotice(`Your enrollment in “${enrollment.courses.title}” was cancelled.`)
    } catch (cancelError) {
      setError(getErrorMessage(cancelError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">My area</h1>
        <p className="page__intro">
          Your enrollments, course calendars, and cancellation options.
        </p>
      </header>

      {isAdmin ? (
        <p className="inline-links">
          <Link className="text-link" to="/admin">
            Open the admin area
          </Link>
        </p>
      ) : null}

      <ErrorNotice>{error}</ErrorNotice>
      <Notice>{notice}</Notice>
      {loading ? <Loading label="Loading your enrollments…" /> : null}

      {!loading && !error && enrollments.length === 0 ? (
        <EmptyState title="You are not enrolled in any course yet">
          Browse the <Link className="text-link" to="/courses">published courses</Link>{' '}
          and choose the one that fits you.
        </EmptyState>
      ) : null}

      <div className="stack">
        {enrollments.map((enrollment) => {
          const course = enrollment.courses
          const lessons = lessonsByCourse[course.id] ?? []
          const canCancel = isBeforeCourseStart(course.starts_on)

          return (
            <article className="enrollment-card" key={enrollment.id}>
              <div className="enrollment-card__header">
                <div>
                  <h2 className="enrollment-card__title">
                    <Link to={`/courses/${course.id}`}>{course.title}</Link>
                  </h2>
                  <p className="enrollment-card__meta">
                    {formatDateRange(course.starts_on, course.ends_on)} ·{' '}
                    {lessons.length}{' '}
                    {lessons.length === 1 ? 'lesson' : 'lessons'}
                  </p>
                </div>
                {course.is_published ? null : (
                  <span className="badge badge--muted">Not published</span>
                )}
              </div>

              {course.description ? (
                <p className="enrollment-card__description">
                  {course.description}
                </p>
              ) : null}

              {lessons.length > 0 ? (
                <details className="disclosure">
                  <summary>Course calendar</summary>
                  <LessonCalendar
                    lessons={lessons}
                    emptyLabel="No lessons scheduled."
                  />
                </details>
              ) : (
                <p className="muted">No lessons scheduled yet.</p>
              )}

              <div className="enrollment-card__actions">
                {canCancel ? (
                  <ConfirmAction
                    label="Cancel enrollment"
                    confirmLabel="Yes, cancel it"
                    cancelLabel="Keep my place"
                    question="Cancel this enrollment?"
                    busy={busyId === enrollment.id}
                    onConfirm={() => handleCancel(enrollment)}
                  />
                ) : (
                  <p className="muted">
                    The cancellation deadline has passed.
                  </p>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard
