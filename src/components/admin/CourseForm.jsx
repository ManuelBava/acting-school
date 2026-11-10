import { useState } from 'react'
import { ErrorNotice } from '../ui/Feedback.jsx'

const EMPTY_VALUES = {
  title: '',
  description: '',
  starts_on: '',
  ends_on: '',
  capacity: '',
  is_published: false,
}

function CourseForm({ initialValues, submitLabel, onSubmit, busy = false }) {
  const [values, setValues] = useState({
    ...EMPTY_VALUES,
    ...initialValues,
    capacity: initialValues?.capacity ?? '',
  })
  const [error, setError] = useState('')

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const title = values.title.trim()
    const capacity = Number(values.capacity)

    if (!title) {
      setError('Please enter a course title.')
      return
    }
    if (!values.starts_on || !values.ends_on) {
      setError('Please set the start and end dates.')
      return
    }
    if (values.ends_on < values.starts_on) {
      setError('The end date cannot be before the start date.')
      return
    }
    if (!Number.isInteger(capacity) || capacity < 1) {
      setError('Capacity must be a whole number of at least 1.')
      return
    }

    await onSubmit({
      title,
      description: (values.description ?? '').trim() || null,
      starts_on: values.starts_on,
      ends_on: values.ends_on,
      capacity,
      is_published: Boolean(values.is_published),
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <ErrorNotice>{error}</ErrorNotice>

      <div className="field">
        <label className="field__label" htmlFor="course-title">
          Title
        </label>
        <input
          className="field__input"
          id="course-title"
          type="text"
          maxLength={160}
          required
          value={values.title}
          onChange={(event) => update('title', event.target.value)}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="course-description">
          Description
        </label>
        <textarea
          className="field__input field__input--textarea"
          id="course-description"
          rows={5}
          value={values.description}
          onChange={(event) => update('description', event.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="field">
          <label className="field__label" htmlFor="course-start">
            Starts on
          </label>
          <input
            className="field__input"
            id="course-start"
            type="date"
            required
            value={values.starts_on}
            onChange={(event) => update('starts_on', event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="course-end">
            Ends on
          </label>
          <input
            className="field__input"
            id="course-end"
            type="date"
            required
            value={values.ends_on}
            onChange={(event) => update('ends_on', event.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="course-capacity">
          Capacity
        </label>
        <input
          className="field__input"
          id="course-capacity"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          required
          value={values.capacity}
          onChange={(event) => update('capacity', event.target.value)}
        />
        <p className="field__hint">
          Capacity cannot be reduced below the number of enrolled students.
        </p>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={Boolean(values.is_published)}
          onChange={(event) => update('is_published', event.target.checked)}
        />
        <span>Published (visible in the public catalog)</span>
      </label>

      <button className="button" type="submit" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

export default CourseForm
