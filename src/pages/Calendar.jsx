import { useEffect, useState } from 'react'
import LessonCalendar from '../components/calendar/LessonCalendar.jsx'
import {
  ConfigNotice,
  EmptyState,
  ErrorNotice,
  Loading,
} from '../components/ui/Feedback.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { fetchPublicLessons } from '../lib/data.js'
import { getErrorMessage } from '../lib/errors.js'

function Calendar() {
  const { configured } = useAuth()
  const [lessons, setLessons] = useState([])
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

    fetchPublicLessons()
      .then((data) => {
        if (active) setLessons(data)
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
        <h1 className="page__title">Calendar</h1>
        <p className="page__intro">
          Lessons of all published courses. Times are shown in the school
          timezone (Europe/Rome).
        </p>
      </header>

      {!configured ? <ConfigNotice /> : null}
      {configured && loading ? <Loading label="Loading the calendar…" /> : null}
      <ErrorNotice>{error}</ErrorNotice>

      {configured && !loading && !error && lessons.length === 0 ? (
        <EmptyState title="No lessons scheduled yet">
          Lessons will appear here once they are added to a published course.
        </EmptyState>
      ) : null}

      {lessons.length > 0 ? (
        <LessonCalendar
          lessons={lessons}
          showCourse
          emptyLabel="No lessons scheduled."
        />
      ) : null}
    </div>
  )
}

export default Calendar
