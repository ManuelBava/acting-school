# AGENTS.md

Operational instructions for this repository.

## PROJECT

- Name: **Acting — The Real Purpose of Being an Artist**.
- Web app for an acting school.
- Do not invent location, teachers, prices, awards, testimonials, or any commercial information.

## LANGUAGE

- UI copy, error messages, accessibility labels, and project documentation: **English**.
- Conversation with the user and explanations of changes: **Italian**.

## STACK

- React 19 and JavaScript with Vite (`.jsx`, no TypeScript).
- React Router 7 for routing.
- `@supabase/supabase-js` for database and authentication.
- Plain CSS. No CSS frameworks, no UI libraries.
- pnpm as package manager.
- Supabase is configured for the development project. URL and publishable key
  live in `.env.local`, which is ignored by Git.
- Do not introduce TypeScript or new dependencies without approval.

## CURRENT STRUCTURE

```
src/
  components/
    admin/          CourseForm, LessonForm/Manager, EnrollmentManager, AdminNav
    calendar/       LessonCalendar
    courses/        CourseCard
    css/            Header.css, Main.css, Footer.css, Content.css, Admin.css
    layout/         Header.jsx, Main.jsx, Footer.jsx
    routing/        RequireAuth, RequireAdmin, ScrollToTop
    ui/             Feedback, ConfirmAction
  context/          auth-context.js, AuthProvider.jsx
  hooks/            useAuth.js
  lib/              supabase.js, data.js, format.js, errors.js
  pages/            public, account, student, admin, and 404 pages
  App.jsx
  App.css
  index.css
  main.jsx
supabase/
  migrations/       versioned SQL migrations
```

## ARCHITECTURE

- Main layout components live in `components/layout`.
- Their styles live in `components/css`, together with shared content and admin CSS.
- Each layout component imports its own CSS. Shared content styles are imported
  once by `App.jsx`.
- `App.jsx` composes providers, router, and layout.
- `App.css` contains only the general app layout and skip link.
- `index.css` contains reset, variables, and global styles.
- `main.jsx` is the entry point and is distinct from `Main.jsx`.
- `Main.jsx` renders the single `<main id="main-content">` element; pages render
  inside it. Keep exactly one `<main>` element per page.
- Plain CSS is global: use specific class names to reduce interference.
- Propose the organization for new pages or features before creating additional
  top-level folders.

## DATABASE

- Only five application tables: `profiles`, `admin_users`, `courses`, `lessons`,
  `enrollments`.
- `courses` rows are scheduled editions; there is no separate catalog entity.
- Admin membership lives only in `admin_users`; never authorize from
  `user_metadata` or `app_metadata`.
- A profile is created automatically by a trigger after signup.
- Enrollments are immediate and unique per `(course_id, user_id)`.
- Students enroll and cancel only before 00:00 Europe/Rome on `starts_on`.
  Admins are exempt from the deadline, never from capacity.
- Cancellation is a hard `DELETE` with no history. There is no API course
  deletion: unpublishing is the archive mechanism.
- Capacity is enforced by a trigger that locks the course row. Do not weaken
  this with client-side checks only.
- RLS is enabled on all five tables with explicit minimal grants. The browser
  uses only the publishable (or legacy anon) key.
- `profiles` updates are limited to the `full_name` column.
- Helper functions belong in the `private` schema with a safe `search_path` and
  minimal `EXECUTE` grants.
- Structural database changes must use versioned migrations in
  `supabase/migrations`; keep local files aligned with remote history.
- Do not modify platform functions, including `public.rls_auto_enable()`.
- Do not create sample users or fake email signups.

## SUPABASE CONFIGURATION

- `.env.example` contains placeholders only. `.env.local` contains the real
  Project URL and publishable key and must stay ignored.
- Never place the service role key or any secret in a `VITE_*` variable, in the
  repository, in logs, or in documentation.
- Never print the key value in summaries or reports.
- Auth Site URL and redirect URLs are configured manually in the Supabase
  dashboard. Use exact origins, not broad wildcards.
- The first admin is created manually in SQL after registration; it is not
  promoted automatically. See `README.md`.
- Do not change global account or platform settings without approval.

## WORKFLOW

- Inspect existing files before proposing changes.
- Work in small tasks; do not anticipate other features.
- Ask for clarification when important decisions are missing.
- Do not commit or push without an explicit request.
- After code changes, run `pnpm lint` and `pnpm build`.
- Report actual results: never claim browser checks that were not actually
  performed.
- Documentation-only changes do not require lint and build.
- If a test cannot be executed, declare it as not executed instead of claiming
  a false confirmation.

## SECURITY AND COSTS

- Do not read or display files containing credentials without specific authorization.
- Never place secrets in code, logs, or documentation.
- Frontend `VITE_*` variables must not contain secrets.
- Do not set up purchases, subscriptions, or paid services.
- Before changing database, RLS policies, Storage, or other external services,
  present the plan and wait for approval.
- Structural database changes must use versioned migrations.
- Do not run destructive operations without explicit approval.
- Route guards are a usability layer; RLS remains the source of truth.
