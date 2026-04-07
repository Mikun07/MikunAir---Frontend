# Frontend Quality Engineering & Testing Strategy

**Service:** MikunAir Frontend SPA  
**Version:** v1.0.0  
**Status:** Approved  
**Date:** 2026-04-26  
**Author:** Festus-Olaleye Ayomikun  
**Depends On:** DESIGN-001-frontend-design.md

---

## 1. Quality Attribute Priorities

| Rank | Attribute | Source |
|---|---|---|
| 1 | Accessibility | NFR-006 (WCAG 2.1 AA — zero axe-core critical violations) |
| 2 | Correctness | All user-facing functional requirements |
| 3 | Performance | NFR-008 (Lighthouse ≥ 80 on mobile) |
| 4 | Security | XSS prevention, token storage, no sensitive data in DOM storage |
| 5 | Maintainability | NFR-010 (80% unit test coverage on business logic hooks and utilities) |

---

## 2. Risk Assessment

### User Experience Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Accessibility failure — screen reader cannot navigate booking flow | High | axe-core automated tests on every component; manual keyboard navigation test pre-release |
| Booking flow loses state on back navigation | High | State preserved in URL query params or React context across steps |
| 409 overbooking response not handled — user sees raw error | High | Explicit 409 handling in booking flow; user-friendly "flight no longer available" message |
| Silent refresh fails — user stuck in broken authenticated state | Medium | Interceptor clears auth state and redirects to login on refresh failure |

### Technical Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Bundle size too large — Lighthouse score fails | Medium | Route-based code splitting (`React.lazy`); Vite bundle analysis |
| Colour contrast violation — WCAG AA failure | Medium | axe-core automated contrast checks; design tokens with AA-compliant values |
| TypeScript type mismatch between API response and component props | Medium | Apollo codegen generates typed hooks from backend GraphQL schema; Axios DTOs manually typed |

---

## 3. Testing Pyramid

```
         ┌────────────────────────────┐
         │      E2E — 5 journeys      │  ← Playwright: critical user journeys
         ├────────────────────────────┤
         │  Component / Integration   │  ← React Testing Library + MSW
         │          (30%)             │
         ├────────────────────────────┤
         │        Unit (60%)          │  ← Vitest: hooks, utilities, formatters
         └────────────────────────────┘
```

---

## 4. Unit Testing Plan

**Framework:** Vitest (TypeScript-native, Vite-compatible)  
**Location:** Alongside source files (`*.test.ts`, `*.test.tsx`)  
**Command:** `npm test` / `npm run test:coverage`

### Components and Hooks to Unit Test

| Target | What to Test |
|---|---|
| `formatPrice(pence)` utility | Correct GBP formatting for typical and edge values (0p, 1p, 100p, 12550p) |
| `BookingReferenceValidator` | Valid 6-char alphanumeric passes; invalid strings rejected |
| `SearchForm` validation logic | Invalid dates rejected; return date before departure rejected; origin = destination rejected |
| `PassengerForm` validation logic | All field constraints enforced; missing required fields rejected |
| `LoginForm` validation logic | Invalid email format rejected; empty password rejected |
| `useAuth` hook | `login()` stores token; `logout()` clears state; `refresh()` updates token |
| `useFlightSearch` hook | Search params passed correctly to Apollo; loading/error/data states exposed correctly |
| `useBooking` hook | Booking DTO assembled correctly from wizard state; `POST /bookings` called once on submit |
| Auth interceptor | JWT attached to every request; 401 triggers refresh; second 401 clears auth state |
| `ProtectedRoute` | Redirects to `/auth/login` when `user === null` |
| `AdminRoute` | Redirects to `/` when role is not `ADMIN` |

**Coverage Target:** ≥ 80% on hooks and utility functions (NFR-010).

---

## 5. Component Testing Plan

**Framework:** React Testing Library + Vitest  
**API Mocking:** MSW (Mock Service Worker) — intercepts real HTTP requests in test environment

### Components to Integration Test

| Component | Scenarios |
|---|---|
| `SearchForm` | Happy path submit fires correct Apollo query; validation errors appear inline; accessibility: all labels associated |
| `FlightResultsList` | Loading skeleton shown while fetching; flight cards render with correct data; empty state shown when no results |
| `FlightCard` | Price displayed in GBP format; "Select" button triggers callback; keyboard-activatable |
| `BookingFlow` | Step 1 → 2 → 3 progression; back navigation restores step state; submit sends correct DTO to API |
| `PassengerForm` | All validation messages appear on submit attempt; errors linked via `aria-describedby` |
| `LoginForm` | Happy path redirects to `/profile`; 401 response shows "Invalid email or password"; 422 shows field errors |
| `RegisterForm` | Successful register redirects to home; consent checkbox required for submit |
| `BookingHistory` | Renders list of bookings; cancel button triggers confirmation modal |
| `Modal` | Focus trapped inside; Escape closes; `aria-modal` set correctly |

---

## 6. Accessibility Testing Plan

**Standard:** WCAG 2.1 Level AA (NFR-006, NFR-014)

| Test Type | Tool | When | Assertion |
|---|---|---|---|
| Automated component scan | `@axe-core/react` via Vitest | Unit/component tests | Zero critical violations per component |
| Full-page scan | Playwright + axe | E2E tests (all 5 journeys) | Zero critical violations per page |
| Keyboard navigation | Playwright keyboard events | E2E tests | All interactive elements Tab-reachable; Enter/Space activate controls |
| Screen reader | Manual (NVDA / VoiceOver) | Pre-release | Booking flow announcements correct; error messages read aloud |
| Colour contrast | axe-core automated | CI on every push | AA ratio ≥ 4.5:1 for normal text; 3:1 for large text |

---

## 7. E2E Testing Plan

**Framework:** Playwright (TypeScript)  
**Location:** `tests/e2e/`  
**Command:** `npm run test:e2e`  
**Environment:** Playwright runs against Docker Compose full-stack (frontend + backend + PostgreSQL)

### Critical User Journeys

| Journey | Steps | Pass Criteria |
|---|---|---|
| **E2E-001** One-way booking (guest) | Search → Select flight → Enter passenger details → Confirm | Booking reference displayed on confirmation screen; no errors |
| **E2E-002** Return flight booking (guest) | Search with return date → Select outbound → Select inbound → Passenger details → Confirm | Both flight segments shown in confirmation |
| **E2E-003** User registration and login | Fill register form → Submit → Redirected to home → Login → Dashboard visible | Dashboard shows user's name; bookings tab available |
| **E2E-004** View booking history | Login → Navigate to `/profile` | At least one booking listed with reference and status |
| **E2E-005** Cancel a booking | Login → Profile → Click cancel → Confirm modal → Submit | Booking status updates to `CANCELLED` in the list |

All 5 journeys must pass in CI before a PR can merge.

---

## 8. Performance Testing Plan

**Tool:** Lighthouse CI  
**When:** CI on every push to `main` and every PR

| Metric | Target |
|---|---|
| Lighthouse Performance (mobile) | ≥ 80 |
| Lighthouse Accessibility | ≥ 90 |
| Lighthouse Best Practices | ≥ 90 |
| First Contentful Paint | ≤ 2.5s on mobile 4G |
| Largest Contentful Paint | ≤ 4s on mobile 4G |
| Bundle size (JS, gzipped) | < 200KB initial chunk |

---

## 9. Security Testing Plan

| Test | Method | Assertion |
|---|---|---|
| Token not in localStorage | Vitest / Playwright check `localStorage` after login | `accessToken` absent from all storage APIs |
| No `dangerouslySetInnerHTML` | ESLint rule `react/no-danger` | Zero violations in CI lint run |
| XSS via flight name | E2E: backend returns `<script>alert(1)</script>` as flight number | Rendered as escaped text; no script executed |
| Protected routes redirect | Playwright: navigate to `/profile` unauthenticated | Redirected to `/auth/login` |
| Admin route guards | Playwright: navigate to `/admin` as USER role | Redirected to `/` |

---

## 10. Quality Gates

| Gate | Condition | On Failure |
|---|---|---|
| Build Gate | `tsc --noEmit` exits with zero errors | Block merge |
| Lint Gate | ESLint + `react/no-danger` exits with zero errors | Block merge |
| Unit Test Gate | All unit tests pass; coverage ≥ 80% on hooks and utilities | Block merge |
| Component Test Gate | All component tests pass including MSW scenarios | Block merge |
| Accessibility Gate | Zero axe-core critical violations across all components | Block merge |
| E2E Gate | All 5 critical user journeys pass | Block merge |
| Security Gate | `npm audit --audit-level=high` exits zero | Block merge |
| Performance Gate | Lighthouse Performance ≥ 80 on mobile | Block deployment to staging |

---

## 11. Test Data Strategy

| Strategy | Detail |
|---|---|
| MSW fixtures | Predefined flight search responses and booking confirmation fixtures for component tests |
| E2E seed data | Shared with backend — `tests/fixtures/seed.sql` loaded into test DB before E2E suite |
| No real PII | All test passenger names, emails, and document numbers are synthetic |

---

## 12. Quality Metrics

| Metric | Target | Collection |
|---|---|---|
| Unit + component test coverage (hooks/utils) | ≥ 80% | Vitest `--coverage` (CI) |
| E2E pass rate | 100% (all 5 journeys) | Playwright CI |
| Accessibility violations (critical) | 0 | axe-core CI |
| Lighthouse Performance (mobile) | ≥ 80 | Lighthouse CI |
| Security vulnerabilities (high+critical) | 0 | `npm audit` CI |

---

*Document controlled under the MikunAir Frontend documentation governance.*  
*Next review: triggered by any new page, new component, or Lighthouse regression.*
