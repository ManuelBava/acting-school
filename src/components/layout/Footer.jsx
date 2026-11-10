import { Link } from 'react-router-dom'
import '../css/Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__name">
          Acting — The Real Purpose of Being an Artist
        </p>
        <nav className="site-footer__nav" aria-label="Footer navigation">
          <Link to="/courses">Courses</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/dashboard">My area</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
