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

- React and JavaScript with Vite (`.jsx`, no TypeScript).
- Plain CSS. No CSS frameworks, no UI libraries.
- pnpm as package manager.
- Supabase is the planned backend but is **not configured yet**.
- Do not introduce TypeScript or new dependencies without approval.

## CURRENT STRUCTURE

```
src/
  components/
    layout/
      Header.jsx
      Main.jsx
      Footer.jsx
    css/
      Header.css
      Main.css
      Footer.css
  App.jsx
  App.css
  index.css
  main.jsx
```

## ARCHITECTURE

- Main layout components live in `components/layout`.
- Their styles live in `components/css`.
- Each component imports its own CSS.
- `App.jsx` composes the layout.
- `App.css` contains only the general app layout.
- `index.css` contains reset, variables, and global styles.
- `main.jsx` is the entry point and is distinct from `Main.jsx`.
- Keep exactly one `<main>` element per page.
- Plain CSS is global: use specific class names to reduce interference.
- Propose the organization for new pages or features before creating additional folders.

## WORKFLOW

- Inspect existing files before proposing changes.
- Work in small tasks; do not anticipate other features.
- Ask for clarification when important decisions are missing.
- Do not commit or push without an explicit request.
- After code changes, run `pnpm lint` and `pnpm build`.
- Report actual results: never claim browser checks that were not actually performed.
- Documentation-only changes do not require lint and build.

## SECURITY AND COSTS

- Do not read or display files containing credentials without specific authorization.
- Never place secrets in code, logs, or documentation.
- Frontend `VITE_*` variables must not contain secrets.
- Do not set up purchases, subscriptions, or paid services.
- Before changing database, RLS policies, Storage, or other external services, present the plan and wait for approval.
- Structural database changes must use versioned migrations.
- Do not run destructive operations without explicit approval.
