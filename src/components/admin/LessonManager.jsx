import { useState } from 'react'
import {
  createLesson,
  deleteLesson,
  updateLesson,
} from '../../lib/data.js'
import { getErrorMessage } from '../../lib/errors.js'
import { formatSchoolDay, formatTime } from '../../lib/format.js'
import ConfirmAction from '../ui/ConfirmAction.jsx'
import { EmptyState, ErrorNotice, Notice } from '../ui/Feedback.jsx'
import LessonForm from './LessonForm.jsx'

function LessonManager({ courseId, lessons, onChanged }) {
  const [editing, setEditing] = useState(null)
  const [formKey, setFormKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSubmit(payload) {
    setBusy(true)
    setError('')
    setNotice('')

    try {
      if (editing) {
        await updateLesson(editing.id, payload)
        setNotice('Lesson updated.')
      } else {
        await createLesson({ ...payload, course_id: courseId })
        setNotice('Lesson added.')
      }
      setEditing(null)
      setFormKey((key) => key + 1)
      await onChanged()
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(lesson) {
    setBusyId(lesson.id)
    setError('')
    setNotice('')

    try {
      await deleteLesson(lesson.id)
      setNotice('Lesson deleted.')
      if (editing?.id === lesson.id) {
        setEditing(null)
        setFormKey((key) => key + 1)
      }
      await onChanged()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="panel" aria-labelledby="lessons-title">
      <h2 className="panel__title" id="lessons-title">
        Lessons
      </h2>

      <ErrorNotice>{error}</ErrorNotice>
      <Notice>{notice}</Notice>

      {lessons.length === 0 ? (
        <EmptyState title="No lessons yet">
          Add the first lesson to build the course calendar.
        </EmptyState>
      ) : (
        <ul className="admin-list">
          {lessons.map((lesson) => (
            <li className="admin-list__item" key={lesson.id}>
              <div>
                <p className="admin-list__title">
                  {lesson.title || 'Lesson'}
                </p>
                <p className="admin-list__meta">
                  {formatSchoolDay(lesson.starts_at)} ·{' '}
                  {formatTime(lesson.starts_at)} – {formatTime(lesson.ends_at)}
                </p>
              </div>
              <div className="admin-list__actions">
                <button
                  type="button"
                  className="button button--small button--ghost"
                  onClick={() => {
                    setEditing(lesson)
                    setFormKey((key) => key + 1)
                  }}
                >
                  Edit
                </button>
                <ConfirmAction
                  label="Delete"
                  confirmLabel="Delete lesson"
                  cancelLabel="Keep it"
                  question="Delete this lesson?"
                  busy={busyId === lesson.id}
                  onConfirm={() => handleDelete(lesson)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="section-title">
        {editing ? `Edit lesson: ${editing.title || 'Lesson'}` : 'Add a lesson'}
      </h3>
      <LessonForm
        key={formKey}
        lesson={editing}
        submitLabel={editing ? 'Save lesson' : 'Add lesson'}
        onSubmit={handleSubmit}
        busy={busy}
      />
      {editing ? (
        <button
          type="button"
          className="button button--small button--ghost"
          onClick={() => {
            setEditing(null)
            setFormKey((key) => key + 1)
          }}
        >
          Cancel edit
        </button>
      ) : null}
    </section>
  )
}

export default LessonManager
