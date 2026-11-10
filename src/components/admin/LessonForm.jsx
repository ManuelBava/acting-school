import { useState } from 'react'
import { fromRomeLocalInput, toRomeLocalInput } from '../../lib/format.js'
import { ErrorNotice } from '../ui/Feedback.jsx'

function LessonForm({ lesson, submitLabel, onSubmit, busy = false }) {
  const [title, setTitle] = useState(lesson?.title ?? '')
  const [startsAt, setStartsAt] = useState(
    lesson ? toRomeLocalInput(lesson.starts_at) : '',
  )
  const [endsAt, setEndsAt] = useState(
    lesson ? toRomeLocalInput(lesson.ends_at) : '',
  )
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!startsAt || !endsAt) {
      setError('Please set the start and end time.')
      return
    }

    const startsAtIso = fromRomeLocalInput(startsAt)
    const endsAtIso = fromRomeLocalInput(endsAt)

    if (new Date(endsAtIso) <= new Date(startsAtIso)) {
      setError('The lesson must end after it starts.')
      return
    }

    await onSubmit({
      title: title.trim() || null,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
    })
  }

  return (
    <form className="form form--compact" onSubmit={handleSubmit} noValidate>
      <ErrorNotice>{error}</ErrorNotice>

      <div className="field">
        <label className="field__label" htmlFor="lesson-title">
          Lesson title (optional)
        </label>
        <input
          className="field__input"
          id="lesson-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="field">
          <label className="field__label" htmlFor="lesson-start">
            Starts at
          </label>
          <input
            className="field__input"
            id="lesson-start"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="lesson-end">
            Ends at
          </label>
          <input
            className="field__input"
            id="lesson-end"
            type="datetime-local"
            required
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
          />
        </div>
      </div>

      <p className="field__hint">Times are entered and shown in Europe/Rome.</p>

      <button className="button" type="submit" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

export default LessonForm
