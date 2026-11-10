import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNav from '../components/admin/AdminNav.jsx'
import CourseForm from '../components/admin/CourseForm.jsx'
import { ErrorNotice } from '../components/ui/Feedback.jsx'
import { createCourse } from '../lib/data.js'
import { getErrorMessage } from '../lib/errors.js'

function AdminCourseNew() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(values) {
    setError('')
    setBusy(true)

    try {
      const course = await createCourse(values)
      navigate(`/admin/courses/${course.id}`, { replace: true })
    } catch (createError) {
      setError(getErrorMessage(createError))
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">New course</h1>
        <p className="page__intro">
          Create a scheduled course. It stays out of the public catalog until
          you publish it.
        </p>
      </header>

      <AdminNav />
      <ErrorNotice>{error}</ErrorNotice>

      <div className="panel panel--form">
        <CourseForm
          submitLabel="Create course"
          onSubmit={handleSubmit}
          busy={busy}
        />
      </div>
    </div>
  )
}

export default AdminCourseNew
