# Frontend Architecture Document

**Service:** MikunAir Frontend SPA  
**Version:** v1.0.0  
**Status:** Approved  
**Date:** 2026-04-26  
**Author:** Festus-Olaleye Ayomikun

---

## 1. Architecture Drivers

Ranked by importance for the frontend:

| Rank | Driver | Source Requirements |
|---|---|---|
| 1 | Accessibility | NFR-006 (WCAG 2.1 AA), NFR-014 (keyboard navigation) |
| 2 | Performance | NFR-008 (Lighthouse ≥ 80 on mobile) |
| 3 | Maintainability | Module boundaries, TypeScript throughout |
| 4 | Testability | Component isolation, React Testing Library |
| 5 | Security | XSS prevention, token storage, CSP compliance |
| 6 | UX Correctness | All functional requirements visible to the user |

---

## 2. Architecture Style

**Selected:** React Single Page Application (SPA) with Vite, TypeScript, and module-based structure.

| Style Evaluated | Verdict |
|---|---|
| Next.js (SSR/SSG) | Rejected — SEO not required for prototype; server complexity unnecessary |
| React SPA (Vite) | **Selected** — simpler, client-side only, fast dev loop, directly matches SAS JD |
| Vue.js | Rejected — React explicitly listed in SAS job description |

**Rationale:** A React SPA with Vite provides a fast development server, optimised production builds, and direct alignment with the target role's technology requirements. The absence of server-side rendering is acceptable because SEO is not a requirement for this booking prototype.

---

## 3. Architectural Decision Records (ADRs)

### ADR-001: React + TypeScript SPA with Vite

**Context:** Frontend framework and build tool selection.

**Options Considered:**
1. Next.js — SSR/SSG, file-based routing, excellent SEO
2. React SPA (Vite) — client-side only, fast dev loop, simpler setup
3. Vue.js — smaller ecosystem, not listed in SAS JD

**Decision:** React 18 + TypeScript + Vite

**Consequences:**
- ✓ Directly matches SAS job description (React.js, TypeScript)
- ✓ Vite's HMR and optimised builds improve developer productivity
- ✓ TypeScript enforces type safety end-to-end
- ✗ No server-side rendering (acceptable — SEO is not a requirement for prototype)

---

### ADR-002: Apollo Client for GraphQL, Axios for REST

**Context:** The frontend consumes two API paradigms: GraphQL (flight search) and REST (all other operations).

**Options Considered:**
1. Apollo Client + Axios — best-in-class for each paradigm
2. urql + Axios — lighter GraphQL client, similar REST approach
3. Fetch API only — no dependencies, but no caching, type generation, or retry logic

**Decision:** Apollo Client for GraphQL (flight search); Axios for REST (bookings, auth, passengers, admin).

**Consequences:**
- ✓ Apollo provides query caching, loading/error state, and TypeScript codegen support
- ✓ Axios provides interceptors for JWT injection and refresh token handling
- ✓ Both are industry-standard and interview-discussable
- ✗ Two client libraries to maintain; justified by the dual-API requirement

---

### ADR-003: Access Token in Memory, Refresh Token in HTTP-Only Cookie

**Context:** Token storage strategy for JWT authentication.

**Options Considered:**
1. `localStorage` — simple but vulnerable to XSS
2. `sessionStorage` — cleared on tab close, still XSS-accessible
3. Memory (JS variable) + HTTP-only cookie for refresh — XSS-safe

**Decision:** Access token stored in React state/context (memory only); refresh token managed by the backend as an HTTP-only cookie.

**Consequences:**
- ✓ XSS attack cannot steal the access token (not in DOM-accessible storage)
- ✓ Refresh token not accessible to JavaScript at all (HTTP-only)
- ✗ Access token lost on page refresh — silent refresh flow needed (handled by Axios interceptor)

---

### ADR-004: React Context for Auth State, TanStack Query for Server State

**Context:** Client-side state management strategy.

**Options Considered:**
1. Redux + RTK Query — powerful, but heavy for this scope
2. Zustand + React Query — lighter, composable
3. React Context (auth) + TanStack Query (server state) — minimal dependencies, sufficient for scope

**Decision:** React Context for authentication state (user identity, access token). TanStack Query for all server-fetched data (bookings, flights, passengers).

**Consequences:**
- ✓ No heavy state management library; Context is sufficient for auth state
- ✓ TanStack Query handles caching, background refetch, loading/error states
- ✓ Straightforward to explain and maintain
- ✗ Context re-renders can propagate widely if not structured carefully (mitigated by splitting contexts)

---

### ADR-005: React Router v6 for Client-Side Routing

**Context:** Navigation between pages in the SPA.

**Decision:** React Router v6 with `createBrowserRouter` and layout routes.

**Consequences:**
- ✓ Industry standard for React SPAs
- ✓ Type-safe with TypeScript
- ✓ Nested routes for layouts (shared header/nav)
- ✗ Additional bundle weight (acceptable given its ubiquity)

---

## 4. Component Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React SPA (Browser)                  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │              React Router v6                    │  │
│  │  /              → Home / Search                 │  │
│  │  /search        → Search Results               │  │
│  │  /booking       → Booking Flow                 │  │
│  │  /booking/:ref  → Booking Confirmation         │  │
│  │  /auth/login    → Login                        │  │
│  │  /auth/register → Register                     │  │
│  │  /profile       → Booking History + Passengers │  │
│  │  /admin         → Admin Flight Management      │  │
│  └───────────────────────┬─────────────────────────┘  │
│                          │                             │
│  ┌───────────────────────▼─────────────────────────┐  │
│  │              Feature Modules                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │  │
│  │  │  search  │ │ booking  │ │ auth/profile │   │  │
│  │  │  module  │ │  module  │ │   module     │   │  │
│  │  └────┬─────┘ └────┬─────┘ └──────┬───────┘   │  │
│  │       │             │              │            │  │
│  │  ┌────▼─────────────▼──────────────▼────────┐  │  │
│  │  │            shared/ui (Design System)     │  │  │
│  │  │  Button, Input, Card, Modal, Spinner,    │  │  │
│  │  │  FlightCard, PassengerForm, BookingSummary│  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └───────────────────────┬─────────────────────────┘  │
│                          │                             │
│  ┌───────────────────────▼─────────────────────────┐  │
│  │              shared/api                         │  │
│  │  Apollo Client (GraphQL — flight search)        │  │
│  │  Axios instance (REST — auth, bookings, etc.)   │  │
│  │  Auth interceptor (token injection + refresh)   │  │
│  └───────────────────────┬─────────────────────────┘  │
└──────────────────────────┼─────────────────────────────┘
                           │ HTTPS
                    Backend REST + GraphQL API
```

---

## 5. Module Structure

| Module | Responsibility | Key Components |
|---|---|---|
| `search` | Search form, results list, flight selection | `SearchForm`, `FlightResultsList`, `FlightCard`, `useFlightSearch` |
| `booking` | Multi-step booking flow: passenger form → seat selection → confirm | `BookingFlow`, `PassengerForm`, `SeatSelector`, `BookingConfirmation`, `useBooking` |
| `auth` | Login, registration, token management, silent refresh | `LoginForm`, `RegisterForm`, `AuthContext`, `useAuth` |
| `profile` | Booking history, saved passenger profiles, GDPR erasure request | `BookingHistory`, `SavedPassengers`, `ErasureRequest` |
| `admin` | Flight schedule management (ADMIN role only) | `FlightTable`, `FlightForm`, `useAdminFlights` |
| `shared/ui` | Design system: atomic and composed components | `Button`, `Input`, `Card`, `Modal`, `Spinner`, `Badge`, `Alert` |
| `shared/api` | HTTP clients, query hooks, error normalisation | `apolloClient.ts`, `axiosClient.ts`, `authInterceptor.ts` |
| `shared/hooks` | Cross-cutting reusable hooks | `useAuth`, `useBooking`, `useFlightSearch` |

---

## 6. Security Architecture

| Threat | Control |
|---|---|
| XSS — token theft | Access token in React state (memory); refresh token in HTTP-only cookie — not accessible to JS |
| XSS — DOM injection | React escapes all values by default; `dangerouslySetInnerHTML` is never used |
| CSRF on refresh | Backend sets `SameSite=Strict` on refresh cookie; frontend does not handle CSRF manually |
| Sensitive data in storage | No PII or tokens ever written to `localStorage` or `sessionStorage` |
| Content Security Policy | Helmet CSP headers set by backend; frontend assets served with restrictive CSP via nginx |
| Clickjacking | `X-Frame-Options: DENY` set by backend Helmet |

---

## 7. Accessibility Architecture

Target: WCAG 2.1 Level AA (NFR-006), keyboard-only navigable (NFR-014).

| Concern | Implementation |
|---|---|
| Semantic HTML | All components use correct heading hierarchy (`h1`–`h3`), landmark roles (`main`, `nav`, `aside`) |
| ARIA labels | All interactive elements without visible labels have `aria-label` or `aria-labelledby` |
| Focus management | Modal dialogs trap focus; booking flow steps move focus to step heading on transition |
| Keyboard navigation | All interactive elements reachable via Tab; Enter/Space activate controls |
| Error announcements | Form errors injected into `aria-live` region so screen readers announce them |
| Colour contrast | All text meets AA contrast ratio (4.5:1 for normal, 3:1 for large text) |
| Automated testing | `axe-core` runs on every component in CI; zero critical violations required |

---

## 8. Performance Architecture

Target: Lighthouse ≥ 80 on mobile (NFR-008).

| Strategy | Implementation |
|---|---|
| Code splitting | React `lazy()` + `Suspense` for each feature module route |
| Bundle optimisation | Vite tree-shaking; no unused imports; named imports from large libraries |
| Image optimisation | SVG for icons; WebP/AVIF for any raster images |
| Caching | TanStack Query caches search results; Apollo caches GraphQL responses |
| Asset serving | nginx serves static assets with long-lived cache headers |
| No SSR overhead | Client-side only; no server-round-trip for initial render (acceptable for prototype) |

---

## 9. Cross-Cutting Concerns

| Concern | Strategy |
|---|---|
| Authentication state | `AuthContext` holds the current user and access token; all components consume via `useAuth()` hook |
| Silent refresh | Axios response interceptor detects 401, calls `/auth/refresh`, retries original request |
| Error handling | Axios interceptor normalises API errors to `AppError` type; components display user-friendly messages |
| Loading states | TanStack Query / Apollo provide `isLoading`, `isFetching` — all async operations show a `Spinner` |
| Route protection | `ProtectedRoute` wrapper component redirects unauthenticated users to `/auth/login` |
| Admin route protection | `AdminRoute` wrapper checks `user.role === 'ADMIN'` before rendering admin pages |

---

## 10. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Accessibility failure — axe-core violations | High | Automated axe-core tests in CI; zero critical violations required to merge |
| Silent refresh loop — 401 on refresh endpoint | High | Interceptor detects refresh failure, clears auth state, redirects to login |
| Search result staleness — user books already-full flight | Medium | `POST /bookings` returns 409 if seats gone; UI shows "flight no longer available" |
| Bundle size exceeds threshold | Medium | Vite bundle analysis in CI; code splitting per route |

---

*Document controlled under the MikunAir Frontend documentation governance.*  
*Next review: triggered by any component architecture change, new route, or major dependency update.*
