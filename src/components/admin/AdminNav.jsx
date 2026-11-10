import { NavLink } from 'react-router-dom'

function adminClass({ isActive }) {
  return isActive ? 'admin-nav__link admin-nav__link--active' : 'admin-nav__link'
}

function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      <NavLink to="/admin" className={adminClass} end>
        Overview
      </NavLink>
      <NavLink to="/admin/courses" className={adminClass}>
        Courses
      </NavLink>
      <NavLink to="/admin/courses/new" className={adminClass}>
        New course
      </NavLink>
      <NavLink to="/admin/students" className={adminClass}>
        Students
      </NavLink>
    </nav>
  )
}

export default AdminNav
