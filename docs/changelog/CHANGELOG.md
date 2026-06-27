# Frontend Changelog

All notable changes to the MikunAir Frontend SPA are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

---

## [1.3.1] - 2026-06-27

### Fixed

- **`frontend/.github/workflows/frontend-ci.yml`** — created the dedicated frontend CI pipeline that was documented in v1.1.0 but never committed; triggers only on changes under `frontend/**`; steps: TypeScript check, lint, unit/component tests with coverage, coverage artifact upload (7-day retention), security audit, production build, dist artifact upload (7-day retention), Docker image build (`--target serve`)
- **`frontend/tsconfig.json`** — removed deprecated `baseUrl` option (warns in TS 5, removed in TS 7); updated `paths` entries to use explicit `./` prefix (`./src/shared/*`, `./src/modules/*`) as required when `baseUrl` is absent

---

## [1.3.0] — 2026-07-07

### Added

- **`airports.ts`** (`src/modules/search/airports.ts`) — static dataset of 37 airports with IATA code, city, country and name; `searchAirports(query)` filter function returning up to 6 matches by code, city, name or country
- **`AirportCombobox` component** (`src/modules/search/AirportCombobox.tsx`) — WCAG 1.1 / ARIA combobox (role="combobox", aria-autocomplete="list", aria-activedescendant) with keyboard navigation (Arrow keys, Enter, Escape), debounced query via `useDebounce`, outside-click dismiss via `useClickOutside`; renders IATA code + city + airport name in dropdown suggestions
- **`PassengerPicker` component** (`src/modules/search/PassengerPicker.tsx`) — adult/child counter panel (role="dialog") with +/− buttons; enforces child-requires-adult rule (children capped to adult count when adults decrease; children increment blocked when adults = 0); max 9 total passengers; `aria-live` live region on counts; warning message when children reduced automatically
- **`DiscountBanner` component** (`src/modules/search/DiscountBanner.tsx`) — promotional deal cards grid (4 deals: NORDIC15, SUMMER25, BIZMILE, EARLYBIRD) with discount %, promo code badge and expiry; aria-label="Current deals and discount codes"
- **`ReviewCarousel` component** (`src/modules/search/ReviewCarousel.tsx`) — auto-advancing passenger review carousel (5s interval, pauses on hover); 5 reviews with star ratings, route badge, avatar initials; keyboard prev/next controls; aria-live="polite" for screen reader announcements; aria-roledescription="carousel"

### Changed

- **`SearchForm`** — fully redesigned: replaced raw IATA `<Input>` with `AirportCombobox`; replaced single passengers `<select>` with `PassengerPicker`; added one-way/round-trip toggle (return date field shown/hidden conditionally); `passengers` field replaced with `adults` + `children`; `tripType` field added to `SearchFormValues`; seat class radios restyled as pill-style toggle buttons
- **`HomePage`** — complete landing page redesign: dark navy/midnight gradient background (`#0f172a → #1e3a5f`); sticky navigation header with blur backdrop; `MikunAirLogo` component with plane icon; `StatBar` (120+ destinations, 2M+ passengers, 4.9 rating, 24/7 support); decorative SVG globe with animated flight path arc; `PopularRoutes` quick-select buttons (4 routes pre-fill search form); `DiscountBanner` and `ReviewCarousel` below the fold; footer with copyright; search form in glassmorphism card (bg-white/5, backdrop-blur-xl)
- **`SearchResultsPage`** — updated URL param parsing to read `adults` + `children` (derives `totalPassengers = adults + children` for API); passes `tripType` in params; updates `initialValues` to populate new `SearchFormValues` shape
- **`index.css`** — replaced single focus-visible rule with full `@theme` block defining MikunAir brand tokens: `--color-sky` (#0ea5e9), `--color-midnight` (#0f172a), `--color-navy` (#1e3a5f), `--color-ink` (#1e293b), `--color-slate` (#64748b), `--color-mist` (#e2e8f0), `--color-surface` (#f8fafc), `--color-promo` (#f59e0b); added `scroll-behavior: smooth`

### Tests

- 111 tests across 16 test files — all passing (was 105 / 16)
- `SearchForm.test.tsx` rewritten (14 tests): uses `role="combobox"` selectors for airport inputs, `aria-label` selector for passenger picker button, `initialValues`-based validation tests for same-origin and past-date cases, new tests for trip type toggle, passenger picker interaction, and adults/children count
- `SearchForm.validation.test.ts` rewritten (10 tests): schema updated to match `adults`/`children`/`tripType` fields, round-trip return date validation, adults-0 rejection

---

## [1.2.0] — 2026-06-27

### Added

- **`formatDate` / `formatTime` / `formatDateShort` utilities** (`src/shared/utils/formatDate.ts`) — locale-aware date/time formatting via `Intl.DateTimeFormat`, with tests
- **`Select` component** (`src/shared/ui/Select.tsx`) — accessible select with label, error, hint and `aria-invalid` support; exported from shared UI index
- **`useDebounce` hook** (`src/shared/hooks/useDebounce.ts`) — generic debounce hook for delaying state updates
- **`Tooltip` component** (`src/shared/ui/Tooltip.tsx`) — hover/focus tooltip with `role="tooltip"` and four position variants
- **`ErrorBoundary` component** (`src/shared/ui/ErrorBoundary.tsx`) — class-based error boundary with default fallback UI, custom fallback prop and reset button; tests added
- **`useLocalStorage` hook** (`src/shared/hooks/useLocalStorage.ts`) — JSON-serialised localStorage with safe read/write fallbacks
- **`Pagination` component** (`src/shared/ui/Pagination.tsx`) — accessible page navigation with `aria-current` and disabled states
- **`usePagination` hook** (`src/shared/hooks/usePagination.ts`) — data-slicing hook paired with Pagination component; integrated into `FlightResultsList`
- **`NotFoundPage` component** (`src/shared/ui/NotFoundPage.tsx`) — 404 page with "Back to home" link; registered as `path="*"` catch-all in `App.tsx`
- **`LoadingPage` component** (`src/shared/ui/LoadingPage.tsx`) — full-screen loading state with Spinner
- **`SkipLink` component** (`src/shared/ui/SkipLink.tsx`) — WCAG 2.4.1 skip navigation link, visible on focus; wired into `App.tsx`
- **`ErrorBoundary` in `App.tsx`** — top-level error boundary; `<main id="main-content">` landmark for SkipLink target
- **`useMediaQuery` hook** (`src/shared/hooks/useMediaQuery.ts`) — responsive breakpoint detection via `window.matchMedia`
- **`useWindowTitle` hook** (`src/shared/hooks/useWindowTitle.ts`) — sets `document.title` to `"{page} — MikunAir"` on mount; applied to `HomePage`, `LoginPage`, `RegisterPage`
- **`Breadcrumbs` component** (`src/shared/ui/Breadcrumbs.tsx`) — accessible `<nav aria-label="Breadcrumb">` with `aria-current="page"` on last item; wired into `BookingDetailPage`
- **`Divider` component** (`src/shared/ui/Divider.tsx`) — horizontal, vertical and labelled divider variants
- **`Tag` component** (`src/shared/ui/Tag.tsx`) — pill tag with optional remove button and colour variants
- **`ProgressBar` component** (`src/shared/ui/ProgressBar.tsx`) — ARIA `progressbar` role with size/variant options; integrated into `BookingFlow` wizard
- **`useClickOutside` hook** (`src/shared/hooks/useClickOutside.ts`) — `pointerdown` outside-click detector for dropdown/drawer dismissal
- **`cn()` utility** (`src/shared/utils/classNames.ts`) — lightweight class name composer; tests added
- **`EmptyState` component** (`src/shared/ui/EmptyState.tsx`) — zero-results view with title, description, icon and action slot; used in `FlightResultsList`
- **`Drawer` component** (`src/shared/ui/Drawer.tsx`) — side panel with backdrop, Escape-key dismiss and `aria-modal`
- **`useToggle` hook** (`src/shared/hooks/useToggle.ts`) — boolean toggle returning `[value, toggle, setValue]`
- **`Banner` component** (`src/shared/ui/Banner.tsx`) — dismissible banner with `info`, `success`, `warning` and `promo` variants

### Changed

- **`formatPrice`** upgraded from template string to `Intl.NumberFormat` for locale-aware GBP formatting; accepts optional `currency` and `locale` parameters
- **`FlightCard`** now imports `formatDate` / `formatTime` from `@shared/utils` instead of a local inline function; displays formatted departure date below route
- **`FlightResultsList`** integrates `usePagination` + `Pagination` (5 results per page) and uses `EmptyState` for zero results
- **`HomePage`** nav links changed from `<a>` to React Router `<Link>`; `useWindowTitle` applied
- **`BookingDetailPage`** back-link replaced with `Breadcrumbs` component
- **`BookingFlow`** step progress now displayed via `ProgressBar` above the wizard card
- **`SearchForm`** passengers select has `aria-describedby` hint (WCAG 2.1)

### Tests

- 105 tests across 16 test files (was 92 / 13) — all passing
- `ErrorBoundary.test.tsx` added (4 tests): no-error render, default fallback, custom fallback, Try-again button presence
- `classNames.test.ts` added (4 tests): joining truthy classes, filtering falsy values, empty string for all-falsy, single class
- `formatDate.test.ts` added (5 tests): date formatting, time format pattern, short date format
- `formatPrice.test.ts` updated: added multi-currency test

---

## [1.1.0] — 2026-06-27

### Added

- **`README.md`**: Full developer documentation — quick start, architecture overview, module map, auth pattern, testing guide, CI/CD pipeline docs, Docker usage, environment variables table, engineering decisions, security notes, accessibility notes
- **Component & integration test suite** — 6 new test files, 53 new tests (total: 13 files, 92 tests, all passing):
  - `SearchForm.test.tsx` — 9 component tests: renders all fields, accessible form label, valid submit fires `onSearch`, validation errors for same-origin/past-date/invalid-return, BUSINESS seat class selection, pre-population from `initialValues`
  - `FlightCard.test.tsx` — 11 tests: flight number/route, GBP price formatting, IATA codes, duration, select callback, `aria-pressed` selected state, low-seat badge (≤5 seats), singular "seat" text, accessible article label, fare breakdown terms
  - `LoginPage.test.tsx` — 6 tests: renders fields, email validation error, empty password error, successful login navigates, 401 server error message, register link present
  - `RegisterPage.test.tsx` — 7 tests: renders all fields, invalid email error, short password error, consent required, successful registration navigates to home, 409 duplicate email message, generic server error, sign-in link
  - `Modal.test.tsx` — 9 tests: hidden when `open=false`, shown when `open=true`, `aria-modal`/`aria-labelledby`, renders title and children, close button fires `onClose`, Escape key fires `onClose`, backdrop click fires `onClose`, close button focusable, no-op on non-Escape keys
  - `BookingFlow.test.tsx` — 9 tests: step 1 initial state, step indicator `aria-current`, blocks step 2 with empty passengers, advances with valid passenger, back navigation, step 3 review, review shows passenger and flight, `createBooking` called with correct DTO, navigates to confirmation
- **Playwright E2E test suite** — 5 journey files covering all QUALITY-001 critical user journeys:
  - `tests/e2e/booking-oneway.spec.ts` (E2E-001): search → select → passenger details → seat class → review → confirm; IATA code format validation; same-origin rejection; empty passenger block
  - `tests/e2e/booking-return.spec.ts` (E2E-002): return flight search → outbound + inbound selection → confirm; one-way search omits return section
  - `tests/e2e/auth.spec.ts` (E2E-003): new user registration; consent required; 409 duplicate email; login with correct credentials; wrong password error; unauthenticated `/profile` redirect; `/admin` redirect for non-admin; sign-out flow
  - `tests/e2e/profile.spec.ts` (E2E-004): profile page structure; booking appears in history after creation; status badges on booking list items; View link navigates to detail page; GDPR erasure section visible; erasure modal opens and dismisses
  - `tests/e2e/cancel-booking.spec.ts` (E2E-005): cancel confirmed booking → status updates to CANCELLED; cancel modal dismissed without cancelling; already-cancelled booking has no cancel button
  - `tests/e2e/helpers.ts`: shared test utilities — `login()`, `searchFlights()`, `fillPassengerForm()`, fixture constants
- **`playwright.config.ts`**: Playwright configuration — Chromium only (CI), `baseURL` from `PLAYWRIGHT_BASE_URL`, retries on CI, HTML + list reporters
- **`.github/workflows/frontend-ci.yml`**: Dedicated frontend CI pipeline (triggers on changes to `frontend/**`): TypeScript check → Lint → Unit + component tests with coverage → Upload coverage artifact → Security audit → Production build → Upload dist artifact → Docker image build (`--target serve`)
- **`vitest.config.ts`** coverage include expanded to cover all 11 files with unit or component tests (was 5 files)

---

## [1.0.0] — 2026-06-27

### Added

- React 18 + TypeScript + Vite SPA (`"type": "module"`, Vite 6, Tailwind CSS v4 via `@tailwindcss/vite`)
- Module structure: `search`, `booking`, `auth`, `profile`, `admin` — all module directories scaffolded per DESIGN-001
- **`shared/api`**: Apollo Client connected to `VITE_API_URL/graphql`; Axios client with `withCredentials`, JWT `Authorization` request interceptor, and silent-refresh response interceptor (retry once on 401, redirect to `/auth/login` on second 401)
- **`shared/ui`** design system: `Button` (variants: primary, secondary, danger, ghost; loading state with ARIA), `Input` (label, error, hint, `aria-describedby`), `Card`, `Modal` (focus trap, Escape key, `role="dialog"`), `Spinner` (`role="status"`), `Alert` (`role="alert"` / `role="status"` by variant), `Badge`
- **`shared/hooks`**: `useFlightSearch` (Apollo query wrapping `searchFlights` GraphQL), `useBooking` (Axios `POST /bookings` with 409 handling)
- **`shared/utils`**: `formatPrice(pence)` → `£X.XX`; `formatDuration(minutes)` → `Xh Ym`
- **`auth` module**: `AuthContext` (login, register, logout, silent refresh on mount), `ProtectedRoute` (redirects to `/auth/login` with `returnTo`), `AdminRoute` (redirects to `/` for non-ADMIN), `LoginPage`, `RegisterPage` (Zod client-side validation, consent checkbox)
- **`search` module**: `SearchForm` (Zod-validated: origin ≠ destination, date in future, return after departure), `FlightCard` (`<article>` with `aria-label`, fare breakdown `<dl>`, `aria-pressed` select button), `FlightResultsList` (loading skeleton, empty state), `HomePage` (hero + search form), `SearchResultsPage` (URL search params driven, outbound + optional inbound selection, "Continue to booking" CTA)
- **`booking` module**: `BookingFlow` (3-step wizard with `useReducer`: Passengers → Seat Class → Review; step indicator with `aria-current="step"`; focus moved to step heading on transition), `PassengerForm` (per-passenger fieldset with Zod validation and `aria-describedby` error linking), `ConfirmationPage` (reference display, total price, links to profile and home)
- **`profile` module**: `ProfilePage` (booking history via TanStack Query, GDPR erasure modal), `BookingDetailPage` (booking detail, passenger list, cancel booking modal)
- **`admin` module**: `AdminPage` (flight schedule table with deactivate, add-flight modal form)
- **`App.tsx`**: route-based code splitting (`React.lazy`), `ApolloProvider`, `QueryClientProvider`, `AuthProvider`, `BrowserRouter`; all 9 routes per DESIGN-001 §2
- Vitest 4 unit test suite — 7 files, 39 tests, all passing; coverage ≥ 80% on all unit-tested modules:
  - `formatPrice.test.ts` — 6 cases (zero, 1p, 100p, 12550p, 99999p, round values)
  - `formatDuration.test.ts` — 4 cases
  - `SearchForm.validation.test.ts` — 8 schema validation cases (same constraints as backend Zod schema)
  - `PassengerForm.validation.test.tsx` — 6 schema + 3 component render cases
  - `AuthContext.test.tsx` — 6 cases (throws outside provider, initial state, login, logout, register, refresh-failure, unauthenticated handler)
  - `ProtectedRoute.test.tsx` — 2 cases (authenticated → renders, unauthenticated → redirects)
  - `AdminRoute.test.tsx` — 3 cases (ADMIN → renders, null → redirects, USER → redirects)
- Multi-stage Dockerfile: `builder` (Vite production build), `development` (Vite dev server HMR), `serve` (nginx)
- nginx config: SPA fallback, 1-year cache for content-hashed assets, `no-cache` for `index.html`, security headers
- `.env.example` with `VITE_API_URL`

### Security

- `vitest` + `@vitest/coverage-v8` pinned to `^4.1.9` — eliminates 2 critical esbuild CVEs (GHSA-67mh-4wv8-2f99) that were present at `^2.x`
- Zero vulnerabilities in `npm audit --audit-level=high`
- Access token stored in React context (memory only) — not in `localStorage` or `sessionStorage`
- `dangerouslySetInnerHTML` never used (DDR-003 compliance)

### Technical Decisions (see `docs/adr/` for full ADRs)

- ADR-001: React SPA with Vite selected over Next.js (SEO not required)
- ADR-002: Apollo Client (GraphQL) + Axios (REST) dual-client approach
- ADR-003: Access token in memory only; refresh token in HTTP-only cookie
- ADR-004: React Context (auth) + TanStack Query (server state) — no Redux
- ADR-005: React Router v6 with layout routes

---

*This changelog covers frontend changes only. See the backend repository for backend release history.*
