import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="page page--narrow">
      <h1 className="page__title">Page not found</h1>
      <p className="page__intro">
        The page you are looking for does not exist or is no longer available.
      </p>
      <p>
        <Link className="text-link" to="/">
          Back to the home page
        </Link>
      </p>
    </div>
  )
}

export default NotFound
