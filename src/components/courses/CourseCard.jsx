import { Link } from 'react-router-dom'
import { formatDateRange } from '../../lib/format.js'

function CourseCard({ course }) {
  return (
    <article className="course-card">
      <div className="course-card__header">
        <p className="course-card__dates">
          {formatDateRange(course.starts_on, course.ends_on)}
        </p>
        {course.is_published ? (
          <span className="badge">Published</span>
        ) : (
          <span className="badge badge--muted">Not published</span>
        )}
      </div>
      <h3 className="course-card__title">
        <Link to={`/courses/${course.id}`}>{course.title}</Link>
      </h3>
      {course.description ? (
        <p className="course-card__description">{course.description}</p>
      ) : null}
      <p className="course-card__meta">
        Capacity: {course.capacity} students
      </p>
    </article>
  )
}

export default CourseCard
