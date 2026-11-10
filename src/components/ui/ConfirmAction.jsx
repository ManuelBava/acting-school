import { useState } from 'react'

function ConfirmAction({
  label,
  confirmLabel = 'Yes, continue',
  cancelLabel = 'Keep it',
  question,
  onConfirm,
  busy = false,
  variant = 'danger',
  className = 'button button--small',
}) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        disabled={busy}
      >
        {label}
      </button>
    )
  }

  return (
    <span className="confirm-action" role="group" aria-label={question}>
      <span className="confirm-action__question">{question}</span>
      <button
        type="button"
        className={`button button--small button--${variant}`}
        onClick={async () => {
          await onConfirm()
          setOpen(false)
        }}
        disabled={busy}
      >
        {busy ? 'Working…' : confirmLabel}
      </button>
      <button
        type="button"
        className="button button--small button--ghost"
        onClick={() => setOpen(false)}
        disabled={busy}
      >
        {cancelLabel}
      </button>
    </span>
  )
}

export default ConfirmAction
