import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import './components/css/Content.css'
import './components/css/Admin.css'
import Footer from './components/layout/Footer.jsx'
import Header from './components/layout/Header.jsx'
import Main from './components/layout/Main.jsx'
import RequireAdmin from './components/routing/RequireAdmin.jsx'
import RequireAuth from './components/routing/RequireAuth.jsx'
import ScrollToTop from './components/routing/ScrollToTop.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import AdminCourseEditor from './pages/AdminCourseEditor.jsx'
import AdminCourseNew from './pages/AdminCourseNew.jsx'
import AdminCourses from './pages/AdminCourses.jsx'
import AdminHome from './pages/AdminHome.jsx'
import AdminStudents from './pages/AdminStudents.jsx'
import Calendar from './pages/Calendar.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import Courses from './pages/Courses.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import Profile from './pages/Profile.jsx'
import Register from './pages/Register.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:courseId" element={<CourseDetail />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminHome />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <RequireAdmin>
            <AdminCourses />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/courses/new"
        element={
          <RequireAdmin>
            <AdminCourseNew />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/courses/:courseId"
        element={
          <RequireAdmin>
            <AdminCourseEditor />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/students"
        element={
          <RequireAdmin>
            <AdminStudents />
          </RequireAdmin>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app">
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Header />
          <Main>
            <AppRoutes />
          </Main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
