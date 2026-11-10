import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminNav from '../components/admin/AdminNav.jsx'
import CourseForm from '../components/admin/CourseForm.jsx'
import EnrollmentManager from '../components/admin/EnrollmentManager.jsx'
import LessonManager from '../components/admin/LessonManager.jsx'
import {
  EmptyState,
  ErrorNotice,
  Loading,
  Notice,
} from '../components/ui/Feedback.jsx'
import {
  fetchAllProfiles,
  fetchCourse,
  fetchCourseEnrollments,
  fetchCourseLessons,
  updateCourse,
} from '../lib/data.js'
import { getErrorMessage } from '../lib/errors.js'

function AdminCourseEditor() {
  const { courseId } = useParams()
  const id = Number(courseId)

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [profiles, setProfiles] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setStatus('missing')
      return undefined
    }

    let active = true
    setStatus('loading')
    setError('')

    Promise.all([
      fetchCourse(id),
      fetchCourseLessons(id),
      fetchCourseEnrollments(id),
      fetchAllProfiles(),
    ])
      .then(([nextCourse, nextLessons, nextEnrollments, nextProfiles]) => {
        if (!active) return
        if (!nextCourse) {
          setStatus('missing')
          return
        }
        setCourse(nextCourse)
        setLessons(nextLessons)
        setEnrollments(nextEnrollments)
        setProfiles(nextProfiles)
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
  }, [id])

  const refreshLessons = useCallback(async () => {
    const next = await fetchCourseLessons(id)
    setLessons(next)
  }, [id])

  const refreshEnrollments = useCallback(async () => {
    const next = await fetchCourseEnrollments(id)
    setEnrollments(next)
  }, [id])

  async function handleSave(values) {
    setBusy(true)
    setError('')
    setNotice('')

    try {
      const updated = await updateCourse(id, values)
      setCourse(updated)
      setNotice('Course saved.')
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="page">
        <Loading label="Loading the course…" />
      </div>
    )
  }

  if (status === 'missing') {
    return (
      <div className="page page--narrow">
        <EmptyState title="Course not found">
          This course does not exist.
        </EmptyState>
        <p>
          <Link className="text-link" to="/admin/courses">
            Back to admin courses
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
          <Link className="text-link" to="/admin/courses">
            Back to admin courses
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page__header">
        <p className="breadcrumb">
          <Link className="text-link" to="/admin/courses">
            Admin courses
          </Link>{' '}
          / {course.title}
        </p>
        <h1 className="page__title">{course.title}</h1>
        <p className="page__intro">
          {course.is_published
            ? 'This course is visible in the public catalog.'
            : 'This course is not published and is visible to admins only.'}
        </p>
      </header>

      <AdminNav />
      <ErrorNotice>{error}</ErrorNotice>
      <Notice>{notice}</Notice>

      <div className="admin-columns">
        <section className="panel panel--form" aria-labelledby="course-details-title">
          <h2 className="panel__title" id="course-details-title">
            Course details
          </h2>
          <CourseForm
            key={course.id}
            initialValues={course}
            submitLabel="Save course"
            onSubmit={handleSave}
            busy={busy}
          />
          <p className="inline-links">
            <Link className="text-link" to={`/courses/${course.id}`}>
              View public course page
            </Link>
          </p>
        </section>

        <div className="stack">
          <LessonManager
            courseId={course.id}
            lessons={lessons}
            onChanged={refreshLessons}
          />
          <EnrollmentManager
            courseId={course.id}
            capacity={course.capacity}
            enrollments={enrollments}
            profiles={profiles}
            onChanged={refreshEnrollments}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminCourseEditor
