export const SCHOOL_TIME_ZONE = 'Europe/Rome'

function timeZoneOffsetMs(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  )
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  return asUtc - date.getTime()
}

export function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

export function formatDateTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: SCHOOL_TIME_ZONE,
  }).format(new Date(value))
}

export function formatTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: SCHOOL_TIME_ZONE,
  }).format(new Date(value))
}

export function formatDateRange(startsOn, endsOn) {
  if (!startsOn && !endsOn) return ''
  if (startsOn && endsOn && startsOn !== endsOn) {
    return `${formatDate(startsOn)} – ${formatDate(endsOn)}`
  }
  return formatDate(startsOn || endsOn)
}

export function todayInSchoolZone() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}

export function isBeforeCourseStart(startsOn) {
  if (!startsOn) return false
  return startsOn > todayInSchoolZone()
}

export function toSchoolDateKey(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export function formatSchoolDay(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: SCHOOL_TIME_ZONE,
  }).format(new Date(value))
}

export function toRomeLocalInput(isoValue) {
  if (!isoValue) return ''
  const date = new Date(isoValue)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  )
  const hour = String(Number(parts.hour) % 24).padStart(2, '0')
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`
}

export function fromRomeLocalInput(localValue) {
  if (!localValue) return null
  const [datePart, timePart = '00:00'] = localValue.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute)
  const firstOffset = timeZoneOffsetMs(
    new Date(wallClockAsUtc),
    SCHOOL_TIME_ZONE,
  )
  const firstGuess = wallClockAsUtc - firstOffset
  const secondOffset = timeZoneOffsetMs(
    new Date(firstGuess),
    SCHOOL_TIME_ZONE,
  )
  return new Date(wallClockAsUtc - secondOffset).toISOString()
}
