import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="page">
      <section className="hero" aria-labelledby="hero-title">
        <span className="hero__accent" aria-hidden="true"></span>
        <p className="hero__eyebrow">Acting school</p>
        <h1 id="hero-title" className="hero__title">
          The Real Purpose of Being an Artist
        </h1>
        <p className="hero__description">
          A space to explore acting, develop your craft, and discover your
          artistic voice. Browse the scheduled courses, follow the lesson
          calendar, and manage your enrollment from one place.
        </p>
        <div className="hero__actions">
          <Link className="button" to="/courses">
            Explore courses
          </Link>
          <Link className="button button--ghost" to="/calendar">
            View the calendar
          </Link>
        </div>
      </section>

      <section className="home-grid" aria-label="School information">
        <article className="panel">
          <h2 className="panel__title">The work</h2>
          <p className="panel__text">
            Acting is a practice of attention, presence, and imagination. The
            school is built around courses that give those ideas room to grow
            through structured lessons.
          </p>
        </article>
        <article className="panel">
          <h2 className="panel__title">Courses and calendar</h2>
          <p className="panel__text">
            Every course is a scheduled edition with its own dates, capacity,
            and lesson calendar. Published courses are visible to everyone;
            enrolled students keep access to their own courses.
          </p>
        </article>
        <article className="panel">
          <h2 className="panel__title">Your account</h2>
          <p className="panel__text">
            Create an account to enroll in a course, review your enrollments,
            and cancel before the enrollment deadline. Your name can be updated
            from your profile at any time.
          </p>
        </article>
      </section>
    </div>
  )
}

export default Home
