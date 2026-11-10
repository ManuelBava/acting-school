# Acting — The Real Purpose of Being an Artist

A web app for an acting school: a curated course catalog, a public lesson
calendar, immediate course enrollment, and a private admin area.

The school's identity is intentionally minimal. Location, teachers, prices,
awards, and testimonials are not invented anywhere in the app.

## Features

### Public area

- Home page with the current dark and gold visual identity.
- Course catalog with every published scheduled course.
- Course detail page with dates, description, capacity, and lessons.
- Public calendar of lessons belonging to published courses.
- Curated empty states when no course or lesson has been published yet.

### Accounts

- Registration with full name, email, and password.
- Login, logout, and persisted session with loading state.
- Email confirmation flow when confirmation is enabled in Supabase Auth.
- Profile page: email, creation date, and editable full name.
- The profile is created automatically when a user signs up.

### Student area

- Immediate enrollment in a published course.
- List of personal enrollments with the course calendar.
- Cancellation before midnight (Europe/Rome) on the day the course starts.
- Access to enrolled courses and their lessons even after a course is
  unpublished from the public catalog.

### Admin area

- Access protected by route guards and by the database on every request.
- Create and edit courses, publish and unpublish them.
- Create, edit, and delete lessons.
- Read enrollments and profiles (profiles are read-only).
- Enroll or remove students; capacity still applies to admins.
- No interface for granting admin privileges: membership is managed in SQL.

Out of scope by design: payments, chat, attendance, video uploads, teaching
materials, and a teacher role. There is no API course deletion: unpublishing is
the archive mechanism.

## Stack

- **React** 19 with **JavaScript** (`.jsx`, no TypeScript)
- **Vite**
- **React Router** 7
- **Supabase** (database, Auth, Row Level Security)
- **Plain CSS** (no CSS frameworks, no UI libraries, no external fonts)
- **Oxlint**
- **pnpm**

## Project structure

```
index.html
public/
src/
  components/
    admin/        course, lesson, and enrollment management
    calendar/     shared lesson calendar
    courses/      course card
    css/          plain CSS, one file per layout/shared area
    layout/       Header, Main, Footer
    routing/      route guards and scroll restoration
    ui/           feedback and confirmation primitives
  context/        auth context and provider
  hooks/          useAuth
  lib/            Supabase client, queries, formatting, errors
  pages/          public, account, student, and admin pages
  App.jsx         providers, router, and layout composition
  App.css         general app layout
  index.css       reset, variables, global styles
  main.jsx        entry point
supabase/
  migrations/     versioned SQL migrations
```

`Main.jsx` holds the single `<main>` element of each page; `main.jsx` is the
application entry point. Each layout component imports its own CSS. Shared
content and admin styles live in `components/css/Content.css` and
`components/css/Admin.css`.

## Environment

Copy `.env.example` to `.env.local` and fill in the public values from the
Supabase project settings:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Only the Project URL and the publishable (or legacy anon) key belong in the
browser. Never place the service role key or any other secret in a `VITE_*`
variable. `.env.local` is ignored by Git.

If the variables are missing, the app renders a configuration notice instead
of failing silently.

## Database

Five tables only:

| Table         | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `profiles`    | One row per auth user; only `full_name` is editable.           |
| `admin_users` | Admin membership. Read-only for API roles; managed in SQL.     |
| `courses`     | One row per scheduled course, with dates, capacity, publishing.|
| `lessons`     | Lesson calendar for a course.                                  |
| `enrollments` | Course enrollment per user, unique per course.                 |

Rules enforced by the database:

- A profile is created automatically after a user signs up.
- Students enroll and cancel only before 00:00 Europe/Rome on `starts_on`.
- Only published courses accept autonomous student enrollment.
- Admins are exempt from the deadline, not from capacity.
- Cancellation is a hard `DELETE`; there is no cancellation history.
- `enrollments.course_id` uses `ON DELETE RESTRICT`: a course with enrollments
  cannot be deleted. Lessons use `ON DELETE CASCADE`.
- Deleting an auth user cascades to profile, enrollments, and admin membership.
- A unique constraint prevents duplicate enrollments.
- Capacity is checked in a trigger that locks the course row, so simultaneous
  requests cannot exceed the limit.
- Capacity cannot be reduced below the number of enrolled students.
- RLS is enabled on every table with explicit, minimal grants.
- `profiles` can only be updated in the `full_name` column.
- Authorization never reads `user_metadata`; admin checks use `admin_users`.
- Helper functions live in the `private` schema with a safe `search_path`.

### Migrations

Applied to the development project and stored in `supabase/migrations`:

1. `20261110210202_initial_schema.sql` — tables, triggers, RLS policies, grants.
2. `20261110210226_tighten_table_grants.sql` — removes unused default
   `TRUNCATE`/`REFERENCES`/`TRIGGER` privileges.
3. `20261110210237_restore_profile_name_update.sql` — restores the
   column-level `UPDATE (full_name)` grant on `profiles`.

Do not edit migration history after it has been applied. Add a new migration
for every schema change.

## First admin

There is deliberately no automatic promotion of the first registered user and
no sample account.

1. Register the admin account from `/register` and confirm the email if
   confirmation is enabled.
2. In the Supabase SQL editor, run a controlled statement such as:

```sql
insert into public.admin_users (user_id)
select id
from auth.users
where email = 'admin@example.com'
on conflict (user_id) do nothing;
```

3. Sign in again. The `Admin` link appears in the header and `/admin` is
   available. Admin permissions are re-checked by the database on every query.
4. Do not expose admin management through the API or the UI. Membership is
   intentionally SQL-only.

## Supabase Auth settings (manual)

In the Supabase dashboard, under **Authentication → URL Configuration**:

- Set **Site URL** to the app origin, for example
  `http://localhost:5173` in development.
- Add the exact production origin as an additional redirect URL when deploying.
- Avoid broad wildcards; list the real origins only.

If **Confirm email** is enabled, the registration page tells the user to check
their inbox before logging in. If it is disabled, registration starts a session
immediately.

## Commands

```bash
pnpm install
pnpm dev      # development server with hot reload
pnpm lint     # Oxlint
pnpm build    # production build
pnpm preview  # preview the production build
```

## Verification status

Performed:

- `pnpm lint`: passes with React advisory warnings only
  (`set-state-in-effect` on data-loading effects).
- `pnpm build`: passes. Vite reports a chunk larger than 500 kB after
  minification because of the Supabase and router dependencies.
- RLS checks using `SET LOCAL ROLE anon` / `authenticated` and simulated JWT
  claims. Anonymous users can read published courses only and cannot read
  profiles, admin membership, or enrollments. Authenticated users cannot
  insert courses, enrollments, or admin membership without the required
  permissions; the `full_name` update is allowed and the `id` update is denied.
- REST smoke test with the publishable key: anonymous `GET /courses` returns
  `200` with an empty list; `GET /profiles` and `GET /admin_users` return
  `401` permission denied.
- Security advisors: only pre-existing platform warnings for
  `public.rls_auto_enable()` remain. That platform function was not modified.
- Test data was rolled back; all application tables still contain zero rows.

Not performed:

- Browser-based end-to-end tests and visual checks.
- Real signup, confirmation email delivery, login, and admin flows with a
  real account.
- Capacity and concurrency tests with genuinely separate database
  connections.
- Automated unit or integration tests (no test dependency was added).

## Security notes

- RLS is the source of truth; frontend route guards are only a usability layer.
- The browser receives only the public project URL and publishable key.
- Admin checks use a separate `admin_users` table, never mutable user metadata.
- `admin_users` is not writable by the API roles.
- Courses cannot be deleted through the API.
- No secrets, sample users, fake emails, or invented commercial data are
  included in this repository.
