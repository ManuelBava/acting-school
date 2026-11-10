# Acting — The Real Purpose of Being an Artist

A web app for an acting school: a space to explore acting, develop your craft, and discover your artistic voice.

## Current stack

- **React** 19 with **JavaScript** (`.jsx`, no TypeScript)
- **Vite** for development and builds
- **Plain CSS** (no UI libraries, no external fonts)
- **Oxlint** for linting
- **pnpm** as package manager

Supabase is planned as the backend but is **not configured yet**. No authentication, database, or routing is set up at this stage.

## Project structure

```
index.html
public/
src/
  assets/
  App.jsx
  App.css
  index.css
  main.jsx
vite.config.js
```

## Commands

Install dependencies:

```bash
pnpm install
```

Run the development server with hot reload:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

Lint the code:

```bash
pnpm lint
```
