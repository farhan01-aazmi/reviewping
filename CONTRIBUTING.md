# Contributing to ReviewPing

Thank you for considering contributing to ReviewPing! We welcome bug reports, feature requests, documentation improvements, and code contributions.

This document outlines the process for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Edge Function Development](#edge-function-development)
- [Database Migrations](#database-migrations)

---

## Code of Conduct

By participating in this project, you agree to:

- **Be respectful** — Disagreement is fine, personal attacks are not.
- **Be constructive** — Criticism should be specific and actionable.
- **Be inclusive** — We welcome contributors of all backgrounds and experience levels.
- **Assume good faith** — Most people want to help. Give them the benefit of the doubt.

---

## Getting Started

### 1. Fork the Repository

Fork the repo on GitHub and clone your fork locally:

```bash
git clone https://github.com/your-username/reviewping.git
cd reviewping
git remote add upstream https://github.com/your-org/reviewping.git
```

### 2. Set Up Your Environment

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

Edit `.env` with your Supabase project credentials (see [README](./README.md#environment-variables) for details).

### 3. Start the Dev Server

```bash
npm run dev
```

The app runs at `http://localhost:5173`. The dev server supports HMR — changes to `src/` are reflected instantly.

### 4. (Optional) Run Supabase Locally

If you're working on edge functions or database migrations:

```bash
# Install the Supabase CLI if you haven't already
npm install -g supabase

# Start local Supabase stack (Docker required)
supabase start

# Run migrations locally
supabase db push
```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed Supabase local setup instructions.

---

## Development Workflow

1. **Pick an issue** — Check [GitHub Issues](https://github.com/your-org/reviewping/issues) for something to work on. Comment on the issue to let others know you're working on it.

2. **Create a branch** — Branch off `main` with a descriptive name:

   ```bash
   git checkout -b feat/add-export-csv
   ```

   Branch naming conventions:
   - `feat/...` — New features
   - `fix/...` — Bug fixes
   - `docs/...` — Documentation changes
   - `refactor/...` — Code refactoring
   - `chore/...` — Tooling, dependencies, CI

3. **Make changes** — Write code, following the [Coding Standards](#coding-standards).

4. **Test your changes** — Verify the app runs and nothing is broken.

5. **Commit** — Follow the [Commit Messages](#commit-messages) guidelines.

6. **Push and open a pull request**.

---

## Pull Request Guidelines

- **One change per PR** — A PR should address one issue or feature. If you find yourself making unrelated changes, split them into separate PRs.
- **Keep PRs focused and small** — PRs under 300 lines are easier and faster to review. Large PRs may be asked to be broken up.
- **Link the issue** — Reference the GitHub issue number in the PR description (e.g., "Closes #42").
- **Write a clear description** — Explain what changed and why. Include screenshots for UI changes.
- **Ensure CI passes** — All lint checks must pass before merging.
- **Update documentation** — If your change adds or modifies functionality, update the relevant docs (README, SUPABASE_SETUP, etc.).
- **Review your own diff first** — Before requesting review, read through your changes as if you were the reviewer. Catch obvious issues early.

### PR Title Format

```
<type>: <brief description>
```

Examples:
```
feat: add CSV export for contacts
fix: handle empty review list in Analytics
docs: update deployment section in README
```

### Pull Request Checklist

Before submitting, confirm:

- [ ] Code builds without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] No new warnings introduced
- [ ] Changes are limited to the scope of the PR
- [ ] Documentation is updated (README, JSDoc, etc.)
- [ ] Environment variables are documented in `.env.example` if new ones were added
- [ ] Edge function changes include updated secrets documentation if applicable
- [ ] Migration changes are reversible or have a rollback plan

---

## Coding Standards

### JavaScript/React

- **Use JSX** — All React components use `.jsx` extension.
- **Functional components** — Use function declarations or arrow functions with hooks. No class components.
- **Named exports** — Export components as named exports.
- **Props** — Use object destructuring in function parameters. Default values for optional props.
- **Hooks** — Follow the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html). Place all `useEffect`, `useState`, and custom hooks at the top of the component.
- **Avoid inline styles in components** — Use the theme token system in `src/data/theme.js` via a `G` import for consistent design tokens.

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings, double quotes for JSX attributes
- **Semicolons**: Required
- **Trailing commas**: Required for multi-line statements
- **Line length**: Aim for under 100 characters
- **File naming**: PascalCase for components, camelCase for utilities

The project uses ESLint with the flat config (`eslint.config.js`). Run linting before committing:

```bash
npm run lint
```

### Component Structure

```jsx
import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";

export function MyComponent({ requiredProp, optionalProp = "default" }) {
  const [state, setState] = useState(initialValue);

  // Logic goes here

  return (
    <div style={{ padding: G.s }}>
      <Btn onClick={handleClick}>{optionalProp}</Btn>
    </div>
  );
}
```

---

## Commit Messages

We follow conventional commit format:

```
<type>: <imperative description>
```

**Types**:
- `feat:` — A new feature
- `fix:` — A bug fix
- `docs:` — Documentation only changes
- `style:` — Code style changes (formatting, missing semicolons, etc.)
- `refactor:` — Code change that neither fixes a bug nor adds a feature
- `perf:` — Performance improvement
- `test:` — Adding or updating tests
- `chore:` — Changes to build process, dependencies, tooling
- `db:` — Database migration changes

**Examples**:
```
feat: add bulk SMS sending to contacts
fix: prevent duplicate review submissions
docs: add Supabase setup guide
refactor: extract API client into dedicated module
db: add auto-profile trigger for OAuth users
```

Keep commit messages short (under 72 characters) and descriptive. If more context is needed, add a blank line and provide additional details in the body.

---

## Testing

Currently, ReviewPing does not have an automated test suite. If you're adding a new feature or fixing a bug, please manually verify:

1. The app renders without console errors.
2. Auth flows work (signup, login, logout, Google OAuth).
3. The feature you changed works in both desktop and mobile viewports.
4. Edge function changes are tested via `curl` or the Supabase Dashboard logs.

If you'd like to add tests, that's a great contribution! Consider using Vitest (native Vite test runner) for unit tests and Playwright for E2E tests.

---

## Documentation

Good documentation is as important as good code. Please:

- **Update README.md** if you add or change environment variables, scripts, or project structure.
- **Update SUPABASE_SETUP.md** if you add new migrations, edge functions, or change the Supabase configuration.
- **Add JSDoc comments** to new functions and components describing their purpose, parameters, and return values.
- **Comment non-obvious logic** — If a piece of code has a non-obvious reason for existing, add a comment explaining *why*, not *what*.

---

## Reporting Bugs

When reporting a bug, please include:

1. **Description** — What happened? What did you expect to happen?
2. **Steps to reproduce** — Minimal, exact steps to trigger the bug.
3. **Screenshots** — If applicable, add screenshots to help explain.
4. **Environment**:
   - Browser and version
   - OS
   - Node.js version
   - Any relevant environment variables (redacted)
5. **Console errors** — Check the browser console and paste any error messages.

---

## Feature Requests

Feature requests are welcome! When suggesting a feature:

1. **Describe the problem** — What pain point does this solve?
2. **Describe the solution** — How should the feature work?
3. **Consider alternatives** — What other approaches have you considered?
4. **Provide context** — Screenshots, mockups, or reference examples are helpful.

---

## Edge Function Development

Edge functions live in `supabase/functions/<name>/index.ts` and run on Deno.

### Local Development

```bash
# Start Supabase locally
supabase start

# Serve a specific function
supabase functions serve ai-write --no-verify-jwt --env-file ./supabase/.env.local
```

### Adding a New Edge Function

1. Create the directory: `supabase/functions/<name>/index.ts`
2. Use the `serve` handler from `https://deno.land/std@0.177.0/http/server.ts`
3. Access secrets via `Deno.env.get("SECRET_NAME")`
4. Set JWT verification in `supabase/config.toml`:

   ```toml
   [EDGE_FUNCTIONS.your-function]
   verify_jwt = true
   ```

5. Deploy: `supabase functions deploy <name>`
6. Add a new function call in `src/api/index.js`
7. Document the new function in [README.md](./README.md#edge-functions)

### Edge Function Standards

- Validate request method (only POST allowed).
- Validate required body fields with clear error messages.
- Handle errors gracefully — never leak raw API errors to the client.
- Log errors with `console.error` for debugging.
- Return consistent JSON response structure: `{ success: true, ... }` or `{ error: "..." }`.

---

## Database Migrations

Migrations are located in `supabase/migrations/` and are run in filename order.

### Adding a Migration

1. Create a new file: `supabase/migrations/003_descriptive_name.sql`
2. Use lowercase table names and double-quote identifiers.
3. Always enable RLS on new tables.
4. Add RLS policies for user-owned data.
5. Add indexes for columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses.
6. Test the migration locally first:

   ```bash
   supabase db push
   ```

### Migration Best Practices

- **Reversible migrations** — Provide a `DOWN` migration (as a comment or separate file) for rollback scenarios.
- **`IF NOT EXISTS` / `IF EXISTS`** — Use guards to make migrations idempotent.
- **Timestamps** — Use `TIMESTAMPTZ` for all date/time columns.
- **UUIDs** — Use `UUID` for primary keys that reference `auth.users`.
- **BIGINT** — Use `BIGINT GENERATED BY DEFAULT AS IDENTITY` for surrogate keys.

---

## Questions?

If you have questions about contributing, open a [Discussion](https://github.com/your-org/reviewping/discussions) or ask in the issue you're working on.

Thank you for helping make ReviewPing better!
