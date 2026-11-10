import { formatTime, toSchoolDateKey } from '../../lib/format.js'

function groupLessonsByDay(lessons) {
  const groups = new Map()
  for (const lesson of lessons) {
    const key = toSchoolDateKey(lesson.starts_at)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(lesson)
  }
  return [...groups.entries()]
}

function LessonCalendar({ lessons, showCourse = false, emptyLabel }) {
  if (!lessons.length) {
    return <p className="muted">{emptyLabel}</p>
  }

  return (
    <div className="lesson-calendar">
      {groupLessonsByDay(lessons).map(([day, dayLessons]) => (
        <section className="lesson-day" key={day}>
          <h3 className="lesson-day__heading">
            <time dateTime={day}>{formatDayHeading(day)}</time>
          </h3>
          <ul className="lesson-day__list">
            {dayLessons.map((lesson) => (
              <li className="lesson-row" key={lesson.id}>
                <span className="lesson-row__time">
                  {formatTime(lesson.starts_at)} – {formatTime(lesson.ends_at)}
                </span>
                <span className="lesson-row__title">
                  {lesson.title || 'Lesson'}
                </span>
                {showCourse && lesson.courses?.title ? (
                  <span className="lesson-row__course">
                    {lesson.courses.title}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function formatDayHeading(dayKey) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dayKey}T00:00:00Z`))
}

export default LessonCalendar
