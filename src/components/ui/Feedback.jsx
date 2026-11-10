function Loading({ label = 'Loading…' }) {
  return (
    <p className="feedback feedback--loading" role="status">
      <span className="feedback__spinner" aria-hidden="true"></span>
      {label}
    </p>
  )
}

function ErrorNotice({ children, id }) {
  if (!children) return null
  return (
    <p className="feedback feedback--error" role="alert" id={id}>
      {children}
    </p>
  )
}

function Notice({ children }) {
  if (!children) return null
  return (
    <p className="feedback feedback--success" role="status">
      {children}
    </p>
  )
}

function EmptyState({ title, children }) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {children ? <p className="empty-state__text">{children}</p> : null}
    </div>
  )
}

function ConfigNotice() {
  return (
    <div className="feedback feedback--error" role="alert">
      <p className="feedback__title">Backend not configured</p>
      <p>
        Add <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to{' '}
        <code>.env.local</code>, then restart the development server.
      </p>
    </div>
  )
}

export { ConfigNotice, EmptyState, ErrorNotice, Loading, Notice }
