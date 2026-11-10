import { supabase } from './supabase'

const COURSE_FIELDS =
  'id, title, description, starts_on, ends_on, capacity, is_published, created_at'
const LESSON_FIELDS = 'id, course_id, title, starts_at, ends_at, created_at'

function client() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.',
    )
  }
  return supabase
}

export async function fetchPublishedCourses() {
  const { data, error } = await client()
    .from('courses')
    .select(COURSE_FIELDS)
    .eq('is_published', true)
    .order('starts_on', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchAllCourses() {
  const { data, error } = await client()
    .from('courses')
    .select(COURSE_FIELDS)
    .order('starts_on', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchCourse(courseId) {
  const { data, error } = await client()
    .from('courses')
    .select(COURSE_FIELDS)
    .eq('id', courseId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchCourseLessons(courseId) {
  const { data, error } = await client()
    .from('lessons')
    .select(LESSON_FIELDS)
    .eq('course_id', courseId)
    .order('starts_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchPublicLessons() {
  const { data, error } = await client()
    .from('lessons')
    .select(
      'id, course_id, title, starts_at, ends_at, courses!inner (id, title, is_published)',
    )
    .eq('courses.is_published', true)
    .order('starts_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchMyEnrollments(userId) {
  const { data, error } = await client()
    .from('enrollments')
    .select(
      'id, course_id, created_at, courses!inner (id, title, description, starts_on, ends_on, capacity, is_published)',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchMyEnrollment(userId, courseId) {
  const { data, error } = await client()
    .from('enrollments')
    .select('id, course_id, user_id, created_at')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchLessonsForCourses(courseIds) {
  if (!courseIds.length) return []
  const { data, error } = await client()
    .from('lessons')
    .select(LESSON_FIELDS)
    .in('course_id', courseIds)
    .order('starts_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createEnrollment(userId, courseId) {
  const { data, error } = await client()
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })
    .select('id, course_id, user_id, created_at')
    .single()
  if (error) throw error
  return data
}

export async function deleteEnrollment(enrollmentId) {
  const { error } = await client()
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId)
  if (error) throw error
}

export async function createCourse(payload) {
  const { data, error } = await client()
    .from('courses')
    .insert(payload)
    .select(COURSE_FIELDS)
    .single()
  if (error) throw error
  return data
}

export async function updateCourse(courseId, payload) {
  const { data, error } = await client()
    .from('courses')
    .update(payload)
    .eq('id', courseId)
    .select(COURSE_FIELDS)
    .single()
  if (error) throw error
  return data
}

export async function createLesson(payload) {
  const { data, error } = await client()
    .from('lessons')
    .insert(payload)
    .select(LESSON_FIELDS)
    .single()
  if (error) throw error
  return data
}

export async function updateLesson(lessonId, payload) {
  const { data, error } = await client()
    .from('lessons')
    .update(payload)
    .eq('id', lessonId)
    .select(LESSON_FIELDS)
    .single()
  if (error) throw error
  return data
}

export async function deleteLesson(lessonId) {
  const { error } = await client().from('lessons').delete().eq('id', lessonId)
  if (error) throw error
}

export async function fetchCourseEnrollments(courseId) {
  const { data, error } = await client()
    .from('enrollments')
    .select('id, user_id, course_id, created_at, profiles!inner (id, full_name)')
    .eq('course_id', courseId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchAllProfiles() {
  const { data, error } = await client()
    .from('profiles')
    .select('id, full_name, created_at')
    .order('full_name', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data ?? []
}

export async function fetchAdminMembership(userId) {
  const { data, error } = await client()
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function fetchProfile(userId) {
  const { data, error } = await client()
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateProfileName(userId, fullName) {
  const { data, error } = await client()
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId)
    .select('id, full_name, created_at')
    .single()
  if (error) throw error
  return data
}
