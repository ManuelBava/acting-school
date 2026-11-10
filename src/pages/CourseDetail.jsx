import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LessonCalendar from '../components/calendar/LessonCalendar.jsx'
import ConfirmAction from '../components/ui/ConfirmAction.jsx'
import {
  ConfigNotice,
  EmptyState,
  ErrorNotice,
  Loading,
  Notice,
} from '../components/ui/Feedback.jsx'
import { useAuth } from '../hooks/useAuth.js'
import {
  createEnrollment,
  deleteEnrollment,
  fetchCourse,
  fetchCourseLessons,
  fetchMyEnrollment,
} from '../lib/data.js'
import { getErrorMessage } from '../lib/errors.js'
import {
  formatDate,
  formatDateRange,
  isBeforeCourseStart,
} from '../lib/format.js'

function CourseDetail() {
  const { courseId } = useParams()
  const id = Number(courseId)
  const { configured, loading: authLoading, user, isAdmin } = useAuth()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrollment, setEnrollment] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [nextCourse, nextLessons, nextEnrollment] = await Promise.all([
      fetchCourse(id),
      fetchCourseLessons(id),
      user ? fetchMyEnrollment(user.id, id) : Promise.resolve(null),
    ])
    return { nextCourse, nextLessons, nextEnrollment }
  }, [id, user])

  useEffect(() => {
    if (!configured || authLoading) return undefined
    if (!Number.isInteger(id) || id <= 0) {
      setStatus('missing')
      return undefined
    }

    let active = true
    setStatus('loading')
    setError('')

    load()
      .then(({ nextCourse, nextLessons, nextEnrollment }) => {
        if (!active) return
        if (!nextCourse) {
          setStatus('missing')
          return
        }
        setCourse(nextCourse)
        setLessons(nextLessons)
        setEnrollment(nextEnrollment)
        setStatus('ready')
      })
      .catch((loadError) => {
        if (!active) return
        setError(getErrorMessage(loadError))
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [configured, authLoading, id, load])

  async function handleEnroll() {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const created = await createEnrollment(user.id, id)
      setEnrollment(created)
      setNotice('You are enrolled. The course is now available in your area.')
    } catch (enrollError) {
      setError(getErrorMessage(enrollError))
    } finally {
      setBusy(false)
    }
  }

  async function handleCancel() {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await deleteEnrollment(enrollment.id)
      setEnrollment(null)
      setNotice('Your enrollment was cancelled.')
    } catch (cancelError) {
      setError(getErrorMessage(cancelError))
    } finally {
      setBusy(false)
    }
  }

  if (!configured) {
    return (
      <div className="page page--narrow">
        <ConfigNotice />
      </div>
    )
  }

  if (authLoading || status === 'loading') {
    return (
      <div className="page page--narrow">
        <Loading label="Loading the course…" />
      </div>
    )
  }

  if (status === 'missing') {
    return (
      <div className="page page--narrow">
        <EmptyState title="Course not found">
          This course does not exist or is no longer available.
        </EmptyState>
        <p>
          <Link className="text-link" to="/courses">
            Back to the courses
          </Link>
        </p>
      </div>
    )
  }

  if (status === 'error' || !course) {
    return (
      <div className="page page--narrow">
        <ErrorNotice>{error || 'Unable to load this course.'}</ErrorNotice>
        <p>
          <Link className="text-link" to="/courses">
            Back to the courses
          </Link>
        </p>
      </div>
    )
  }

  const enrollmentOpen =
    course.is_published && isBeforeCourseStart(course.starts_on)
  const canCancel = enrollment && isBeforeCourseStart(course.starts_on)

  return (
    <div className="page">
      <p className="breadcrumb">
        <Link className="text-link" to="/courses">
          Courses
        </Link>{' '}
        / {course.title}
      </p>

      <header className="course-detail__header">
        <div>
          <p className="course-card__dates">
            {formatDateRange(course.starts_on, course.ends_on)}
          </p>
          <h1 className="page__title">{course.title}</h1>
        </div>
        {course.is_published ? (
          <span className="badge">Published</span>
        ) : (
          <span className="badge badge--muted">Not published</span>
        )}
      </header>

      <ErrorNotice>{error}</ErrorNotice>
      <Notice>{notice}</Notice>

      {!course.is_published ? (
        <p className="callout">
          {enrollment
            ? 'This course is no longer listed publicly, but you keep access because you are enrolled.'
            : 'This course is not published. It is visible to admins only.'}
        </p>
      ) : null}

      <div className="course-detail__grid">
        <section className="course-detail__main" aria-labelledby="about-title">
          <h2 className="section-title" id="about-title">
            About the course
          </h2>
          {course.description ? (
            <p className="prose">{course.description}</p>
          ) : (
            <p className="muted">No description has been added yet.</p>
          )}

          <h2 className="section-title">Calendar</h2>
          <LessonCalendar lessons={lessons} emptyLabel="No lessons scheduled yet." />
        </section>

        <aside className="course-detail__aside" aria-labelledby="enrollment-title">
          <h2 className="section-title" id="enrollment-title">
            Enrollment
          </h2>
          <dl className="details-list">
            <div className="details-list__row">
              <dt>Dates</dt>
              <dd>{formatDateRange(course.starts_on, course.ends_on)}</dd>
            </div>
            <div className="details-list__row">
              <dt>Capacity</dt>
              <dd>{course.capacity} students</dd>
            </div>
          </dl>

          {enrollment ? (
            <div className="stack stack--tight">
              <p className="status-line">You are enrolled in this course.</p>
              {canCancel ? (
                <ConfirmAction
                  label="Cancel enrollment"
                  confirmLabel="Yes, cancel it"
                  cancelLabel="Keep my place"
                  question="Cancel this enrollment?"
                  busy={busy}
                  onConfirm={handleCancel}
                />
              ) : (
                <p className="muted">
                  The cancellation deadline has passed.
                </p>
              )}
            </div>
          ) : isAdmin ? (
            <p>
              <Link className="text-link" to={`/admin/courses/${course.id}`}>
                Manage this course in the admin area
              </Link>
            </p>
          ) : !user ? (
            <div className="stack stack--tight">
              <p className="muted">
                Log in or create an account to enroll in this course.
              </p>
              <Link
                className="button"
                to="/login"
                state={{ from: `/courses/${course.id}` }}
              >
                Log in to enroll
              </Link>
              <Link className="text-link" to="/register">
                Create an account
              </Link>
            </div>
          ) : enrollmentOpen ? (
            <div className="stack stack--tight">
              <button
                className="button"
                type="button"
                onClick={handleEnroll}
                disabled={busy}
              >
                {busy ? 'Enrolling…' : 'Enroll in this course'}
              </button>
              <p className="field__hint">
                Enrollment closes at midnight (Europe/Rome) before the course
                starts on {formatDate(course.starts_on)}.
              </p>
            </div>
          ) : (
            <p className="muted">
              {course.is_published
                ? `Enrollment closed at midnight (Europe/Rome) before ${formatDate(course.starts_on)}.`
                : 'This course is not open for enrollment.'}
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}

export default CourseDetail
