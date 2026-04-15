# MikunAir Frontend

React 18 + TypeScript + Vite SPA for the MikunAir flight booking application.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Type-check
npm run typecheck

# Lint
npm run lint

# Production build
npm run build
```

**Requires:** Node.js 20+, npm 10+

Copy `.env.example` to `.env` and set `VITE_API_URL` before starting:

```bash
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3000
```

---

## Architecture

### Stack

| Layer | Technology | Version |
|---|---|---|
| UI framework | React | 18 |
| Language | TypeScript | 5.7 |
| Build tool | Vite | 6 |
| Styling | Tailwind CSS | 4 (via `@tailwindcss/vite`) |
| GraphQL client | Apollo Client | 3 |
| REST client | Axios | 1.7 |
| Server state | TanStack Query | 5 |
| Routing | React Router | 6 |
| Validation | Zod | 3 |
| Testing | Vitest + React Testing Library | 4 + 16 |
| E2E | Playwright | — |

### Module Structure

```
src/
├── modules/
│   ├── search/          # SearchForm, FlightCard, FlightResultsList, pages
│   ├── booking/         # BookingFlow (3-step wizard), PassengerForm, ConfirmationPage
│   ├── auth/            # AuthContext, ProtectedRoute, AdminRoute, LoginPage, RegisterPage
│   ├── profile/         # ProfilePage (bookings + GDPR erasure), BookingDetailPage
│   └── admin/           # AdminPage (flight schedule management)
└── shared/
    ├── api/             # Apollo client, Axios client + silent-refresh interceptor
    ├── hooks/           # useFlightSearch, useBooking
    ├── ui/              # Button, Input, Card, Modal, Spinner, Alert, Badge
    └── utils/           # formatPrice (pence → £), formatDuration (minutes → Xh Ym)
```

### Path Aliases

| Alias | Resolves to |
|---|---|
| `@shared/*` | `src/shared/*` |
| `@modules/*` | `src/modules/*` |

### Auth Pattern

- Access token: stored in React context (memory only — never `localStorage`)
- Refresh token: stored in HTTP-only cookie (set by backend)
- Silent refresh: on app mount, `AuthProvider` calls `POST /auth/refresh`
- Interceptor: Axios response interceptor retries once on 401 using the refresh token; on second 401, clears auth state and redirects to login

### State Management

- **Auth state:** React Context (`AuthContext`) — single source of truth for user + access token
- **Server state:** TanStack Query — bookings, flight results, booking details
- **Booking wizard:** `useReducer` inside `BookingFlow` — 3-step wizard state (passengers, seat class, review)
- **No Redux** — scope does not warrant it (ADR-004)

---

## Testing

### Unit & Component Tests

```bash
npm test               # run once
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
```

**Framework:** Vitest 4 + React Testing Library 16 + MSW 2

**Coverage target:** ≥ 80% on all unit-tested modules (hooks, utilities, auth logic, form validation)

| Test file | What it covers |
|---|---|
| `shared/utils/formatPrice.test.ts` | Price formatting from integer pence to GBP string |
| `shared/utils/formatDuration.test.ts` | Duration formatting from minutes to `Xh Ym` |
| `modules/search/SearchForm.validation.test.ts` | Zod schema: origin/destination, date constraints, passenger limits |
| `modules/search/SearchForm.test.tsx` | Component: renders, submits, shows validation errors |
| `modules/search/FlightCard.test.tsx` | Component: renders prices, select button, low-seat badge |
| `modules/auth/AuthContext.test.tsx` | Hook: login, logout, register, refresh, unauthenticated handler |
| `modules/auth/ProtectedRoute.test.tsx` | Redirects unauthenticated users to login |
| `modules/auth/AdminRoute.test.tsx` | Redirects non-ADMIN users to home |
| `modules/auth/LoginPage.test.tsx` | Component: validation errors, successful login, 401 error message |
| `modules/auth/RegisterPage.test.tsx` | Component: validation, consent required, 409 duplicate email |
| `modules/booking/PassengerForm.validation.test.tsx` | Schema + component: field constraints, error display |
| `modules/booking/BookingFlow.test.tsx` | Wizard: step progression, validation gate, confirm submission |
| `shared/ui/Modal.test.tsx` | Focus trap, Escape key, backdrop click, aria attributes |

### E2E Tests

```bash
# Requires Docker Compose full-stack running
docker compose up -d
npx playwright test
```

**Framework:** Playwright (TypeScript)  
**Location:** `tests/e2e/`

| Journey | File |
|---|---|
| E2E-001: One-way booking (guest) | `tests/e2e/booking-oneway.spec.ts` |
| E2E-002: Return flight booking (guest) | `tests/e2e/booking-return.spec.ts` |
| E2E-003: User registration and login | `tests/e2e/auth.spec.ts` |
| E2E-004: View booking history | `tests/e2e/profile.spec.ts` |
| E2E-005: Cancel a booking | `tests/e2e/cancel-booking.spec.ts` |

---

## CI/CD

The frontend CI pipeline runs on every push and pull request via GitHub Actions (`.github/workflows/frontend-ci.yml`):

| Step | Command | Gate |
|---|---|---|
| TypeScript check | `tsc --noEmit` | Block merge |
| Lint | `eslint src` | Block merge |
| Unit + component tests | `vitest run --coverage` | Block merge (coverage ≥ 80%) |
| Security audit | `npm audit --audit-level=high` | Block merge |
| Production build | `npm run build` | Block merge |
| Docker image build | `docker build --target serve` | Block merge |

---

## Docker

```bash
# Development (HMR)
docker build --target development -t mikunair-frontend:dev .
docker run -p 5173:5173 mikunair-frontend:dev

# Production
docker build --target serve -t mikunair-frontend:prod .
docker run -p 80:80 mikunair-frontend:prod
```

The nginx production image:
- Serves `dist/` at port 80
- SPA fallback: all routes serve `index.html`
- Assets (`/assets/*`): `Cache-Control: public, max-age=31536000, immutable`
- `index.html`: `Cache-Control: no-cache`
- Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL of the backend API (e.g. `http://localhost:3000`) |
| `VITE_APP_VERSION` | No | Injected at build time; defaults to `development` |

All variables are public (no secrets). They are inlined into the JS bundle at build time by Vite (`VITE_` prefix).

---

## Engineering Decisions

Full ADRs are in `docs/adr/`. Key decisions:

| Decision | Rationale |
|---|---|
| React SPA (not Next.js) | SEO not required; SPA is simpler and sufficient (ADR-001) |
| Apollo Client for GraphQL | Flight search uses GraphQL; Apollo provides typed queries and caching |
| Axios for REST | Booking, auth, and profile use REST; Axios interceptors power the silent-refresh pattern |
| Access token in memory | Never persisted to storage — mitigates XSS token theft (ADR-003) |
| TanStack Query (not Redux) | Server state only; no global client state needed beyond auth (ADR-004) |
| Vitest (not Jest) | Vite-native; faster; no Babel transform needed; same config as app |
| Tailwind v4 | Vite plugin integration; no PostCSS config; `@import "tailwindcss"` in CSS |

---

## Security Notes

- `dangerouslySetInnerHTML` is never used (ESLint `react/no-danger` enforced in CI)
- Access token stored only in React state (not `localStorage` or `sessionStorage`)
- Refresh token stored only in HTTP-only cookie — not readable by JavaScript
- No secrets, credentials, or API keys are present in the frontend codebase
- All user input is validated with Zod before submission

---

## Accessibility

Target: WCAG 2.1 Level AA (NFR-006)

- All form inputs have associated `<label>` elements
- Errors are linked to inputs via `aria-describedby`
- Modal: `role="dialog"`, `aria-modal="true"`, focus trapped, Escape closes
- Booking wizard: `aria-current="step"` on active step; focus moved to step heading on transition
- Buttons with icon-only content have `aria-label`
- FlightCard uses `<article>` with `aria-label`; Select button uses `aria-pressed`
- Screen reader live regions: `role="alert"` on error messages, `role="status"` on spinner

---

## Project Governance

This frontend follows the six-phase MikunAir governance framework.  
Documentation: `docs/requirements/`, `docs/architecture/`, `docs/design/`, `docs/quality/`, `docs/devops/`, `docs/adr/`  
Changelog: `docs/changelog/CHANGELOG.md`
