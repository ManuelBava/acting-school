export function getErrorMessage(error) {
  if (!error) return ''
  const message = error.message || String(error)
  const code = error.code

  if (code === '23505' || message.includes('duplicate key')) {
    return 'You are already enrolled in this course.'
  }
  if (message.includes('course_full')) {
    return 'This course is full.'
  }
  if (message.includes('capacity_below_enrollments')) {
    return 'Capacity cannot be lower than the number of enrolled students.'
  }
  if (message.includes('course_not_found')) {
    return 'This course is no longer available.'
  }
  if (
    code === '23514' ||
    message.includes('violates check constraint') ||
    message.includes('violates foreign key constraint')
  ) {
    return 'Please check the dates, capacity, and required fields.'
  }
  if (message.includes('row-level security') || code === '42501') {
    return 'You do not have permission to perform this action.'
  }
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Please confirm your email address before signing in.'
  }
  if (message.includes('User already registered')) {
    return 'An account with this email already exists.'
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters.'
  }
  if (message.includes('Unable to validate email')) {
    return 'Please enter a valid email address.'
  }

  return message
}
