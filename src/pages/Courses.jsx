import { useEffect, useState } from 'react'
import CourseCard from '../components/courses/CourseCard.jsx'
import {
  ConfigNotice,
  EmptyState,
  ErrorNotice,
  Loading,
} from '../components/ui/Feedback.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { fetchPublishedCourses } from '../lib/data.js'
import { getErrorMessage } from '../lib/errors.js'

function Courses() {
  const { configured } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError('')

    fetchPublishedCourses()
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
  }, [configured])

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Courses</h1>
        <p className="page__intro">
          Scheduled courses currently open to the public. Open a course to read
          the details and enroll.
        </p>
      </header>

      {!configured ? <ConfigNotice /> : null}
      {configured && loading ? <Loading label="Loading courses…" /> : null}
      <ErrorNotice>{error}</ErrorNotice>

      {configured && !loading && !error && courses.length === 0 ? (
        <EmptyState title="No published courses yet">
          New courses will appear here as soon as they are published.
        </EmptyState>
      ) : null}

      {courses.length > 0 ? (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard course={course} key={course.id} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default Courses
