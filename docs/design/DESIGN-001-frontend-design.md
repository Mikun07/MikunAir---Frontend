# Frontend Software Design Document

**Service:** MikunAir Frontend SPA  
**Version:** v1.0.0  
**Status:** Approved  
**Date:** 2026-04-26  
**Author:** Festus-Olaleye Ayomikun  
**Depends On:** ARCH-001-frontend-architecture.md

---

## 1. Module Catalog

| Module | Responsibility | Location |
|---|---|---|
| `search` | Flight search form, results display, flight selection | `src/modules/search/` |
| `booking` | Multi-step booking flow: passengers → seat class → confirmation | `src/modules/booking/` |
| `auth` | Login, registration, auth context, silent token refresh | `src/modules/auth/` |
| `profile` | Booking history, saved passenger profiles, GDPR erasure request | `src/modules/profile/` |
| `admin` | Flight schedule CRUD (ADMIN role only) | `src/modules/admin/` |
| `shared/ui` | Reusable design system components | `src/shared/ui/` |
| `shared/api` | Apollo GraphQL client, Axios REST client, auth interceptor | `src/shared/api/` |
| `shared/hooks` | Cross-cutting React hooks | `src/shared/hooks/` |

---

## 2. Page & Route Design

| Route | Component | Auth | Description |
|---|---|---|---|
| `/` | `HomePage` | None | Search entry point |
| `/search` | `SearchResultsPage` | None | Outbound + optional inbound flight results |
| `/booking` | `BookingFlowPage` | None (guests allowed) | Step 1: passengers, Step 2: seat class, Step 3: review |
| `/booking/confirmation/:ref` | `ConfirmationPage` | None | Success screen with booking reference |
| `/auth/login` | `LoginPage` | None | Login form |
| `/auth/register` | `RegisterPage` | None | Registration form |
| `/profile` | `ProfilePage` | Bearer (USER) | Booking history + saved passengers |
| `/profile/bookings/:ref` | `BookingDetailPage` | Bearer (USER) | Single booking detail + cancel button |
| `/admin` | `AdminPage` | Bearer (ADMIN) | Flight schedule management table |

---

## 3. Component Design

### Search Module

**`SearchForm`**
- Inputs: origin (IATA), destination (IATA), departure date, passenger count (1–9), optional return date, optional seat class
- Validation: origin ≠ destination; departure date in the future; return date after departure date
- On submit: navigates to `/search` with query params; triggers `useFlightSearch` hook

**`FlightResultsList`**
- Renders `outbound` and optional `inbound` flight arrays from Apollo query
- Shows loading skeleton while `isLoading`
- Shows empty state message if no flights returned

**`FlightCard`**
- Displays: flight number, origin → destination, departure/arrival times, duration, stops, fare breakdown (base + taxes + total, in GBP)
- Accessibility: `<article>` element, `aria-label="Flight {flightNumber} from {origin} to {destination}"`
- CTA: "Select" button — highlighted when selected

---

### Booking Module

**`BookingFlow`**
- Three-step wizard: Passengers → Seat Class → Review & Confirm
- Step state managed locally with `useReducer`
- Focus moved to step heading on each transition (accessibility)

**`PassengerForm`**
- Fields per passenger: full name, date of birth, document type (PASSPORT | ID_CARD), document number
- Zod schema validation (client-side mirrors backend Zod schema)
- `aria-live` region announces validation errors for screen readers

**`BookingConfirmation`**
- Displays: booking reference, flight details, passenger names, total price in GBP
- Call to action: "View Booking" → `/profile/bookings/:ref`

---

### Auth Module

**`AuthContext`**
- Shape: `{ user: UserPublicDTO | null, accessToken: string | null, login, logout, refresh }`
- `login()` calls `POST /api/v1/auth/login` → stores `accessToken` in context (memory only)
- `logout()` calls `POST /api/v1/auth/logout` → clears context and refresh token cookie
- `refresh()` calls `POST /api/v1/auth/refresh` → updates `accessToken` in context

**`useAuth`** — consumes `AuthContext`; throws if used outside `AuthProvider`

**`ProtectedRoute`**
- HOC: redirects to `/auth/login` if `user === null`
- Passes `returnTo` query param so post-login redirect restores the original destination

**`AdminRoute`**
- HOC: redirects to `/` if `user.role !== 'ADMIN'`

---

### shared/api

**`apolloClient.ts`**
- Connects to `VITE_API_URL + /graphql`
- In-memory cache with field-level normalisation on `FlightOption.id`

**`axiosClient.ts`**
- Base URL: `VITE_API_URL + /api/v1`
- Credentials: `withCredentials: true` (sends refresh token cookie automatically)
- Request interceptor: attaches `Authorization: Bearer {accessToken}` on every request
- Response interceptor:
  - On 401: call `POST /auth/refresh` → update token → retry original request once
  - On second 401: clear auth state → redirect to `/auth/login`

---

## 4. State Management Design

| State Type | Tool | Location |
|---|---|---|
| Authentication (user identity, access token) | React Context (`AuthContext`) | `src/modules/auth/AuthContext.tsx` |
| Server data (flights, bookings, passengers) | TanStack Query (REST) + Apollo (GraphQL) | Query hooks per module |
| Booking wizard step state | `useReducer` (local) | `BookingFlow` component |
| UI state (modal open, loading, error) | `useState` (local) | Individual components |

**Rule:** No global state outside `AuthContext`. All server state owned by TanStack Query or Apollo. No Redux.

---

## 5. API Integration Design

### GraphQL — Flight Search

```typescript
// Generated types via Apollo codegen from backend schema.graphql
const SEARCH_FLIGHTS = gql`
  query SearchFlights(
    $origin: String!
    $destination: String!
    $departureDate: String!
    $passengers: Int!
    $returnDate: String
    $seatClass: SeatClass
  ) {
    searchFlights(
      origin: $origin
      destination: $destination
      departureDate: $departureDate
      passengers: $passengers
      returnDate: $returnDate
      seatClass: $seatClass
    ) {
      outbound { id flightNumber departureAt arrivalAt durationMinutes availableSeats
        farePerPassenger { baseFarePence taxesPence totalPence currency }
        origin { iataCode city } destination { iataCode city }
      }
      inbound { id flightNumber departureAt arrivalAt durationMinutes availableSeats
        farePerPassenger { baseFarePence taxesPence totalPence currency }
        origin { iataCode city } destination { iataCode city }
      }
    }
  }
`;
```

### REST — Booking Creation

```typescript
// POST /api/v1/bookings
interface CreateBookingRequest {
  outboundFlightId: string;
  inboundFlightId?: string;
  seatClass: 'ECONOMY' | 'BUSINESS';
  passengers: Array<{
    fullName: string;
    dateOfBirth: string;       // ISO date
    documentType: 'PASSPORT' | 'ID_CARD';
    documentNumber: string;
  }>;
}

interface BookingConfirmationResponse {
  bookingId: string;
  reference: string;           // 6-char alphanumeric
  status: 'CONFIRMED';
  totalPricePence: number;     // integer pence — formatted to GBP for display
}
```

**Money display rule:** `totalPricePence / 100` formatted to 2 decimal places with `£` prefix. All price values from the API are integer pence.

---

## 6. Form Validation Design

Client-side validation mirrors the backend Zod schemas. Invalid forms never reach the API.

| Form | Key Validation Rules |
|---|---|
| `SearchForm` | Origin and destination must differ; departure date must be in the future; return date must be after departure |
| `PassengerForm` | Full name: 2–100 chars; DOB: minimum age 0, maximum 120 years; document number: non-empty |
| `LoginForm` | Email: valid format; password: non-empty |
| `RegisterForm` | Email: valid format; password: min 8 chars; consent checkbox required |

All validation errors rendered below the relevant input field, associated via `aria-describedby`.

---

## 7. Error Handling Design

| Error Source | Handling |
|---|---|
| Apollo network error | Displayed as page-level `Alert` component with retry button |
| Apollo GraphQL error | Field-level or page-level message depending on error code |
| Axios 400 / 422 | Form-level or field-level validation error display |
| Axios 401 | Silent refresh attempted; if refresh fails → redirect to `/auth/login` |
| Axios 403 | "You don't have permission" page |
| Axios 409 (overbooking) | "This flight is no longer available" message in booking flow |
| Axios 500 | "Something went wrong" page with correlation ID (from response body) |

---

## 8. Design Patterns Applied

| Pattern | Applied Where |
|---|---|
| Context + Provider | `AuthContext` for auth state; `QueryClientProvider` for TanStack Query |
| Custom Hook | `useAuth`, `useFlightSearch`, `useBooking` — encapsulate complex logic, return clean interface |
| Compound Component | `BookingFlow` — parent manages step state; child step components receive state via context |
| Route-based code splitting | `React.lazy()` on each module's page component |
| DTO mapping | API response shapes mapped to view models before rendering (money formatting, date formatting) |

---

## 9. Accessibility Design

| Component | Accessibility Implementation |
|---|---|
| `SearchForm` | All inputs have associated `<label>`; date fields use `type="date"` with visible label; submit button has descriptive text |
| `FlightCard` | `<article>` with `aria-label`; price information uses `<dl>` list |
| `BookingFlow` | Step indicator uses `aria-current="step"`; step transitions move focus to new step heading |
| `PassengerForm` | Error messages linked to inputs via `aria-describedby`; error summary in `aria-live="assertive"` |
| `Modal` | Focus trapped inside; `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title; Escape closes |
| `Button` | `disabled` state has `aria-disabled="true"` and visual styling; loading state adds `aria-label="Loading..."` |

---

## 10. Design Decision Records (DDRs)

### DDR-001: TanStack Query over Redux for Server State

**Context:** Need client-side caching and loading/error state for REST API responses.

**Options:** Redux + RTK Query, Zustand + React Query, TanStack Query standalone

**Decision:** TanStack Query. Handles caching, background refresh, loading and error states out of the box. No boilerplate reducers.

**Consequences:** ✓ Minimal code for server state management. ✓ Automatic background refetch keeps UI fresh. ✗ Not a general state manager (intentional — only server state belongs here).

---

### DDR-002: GBP Pence Formatting at the View Layer

**Context:** All prices arrive from the API as integer pence. The UI must display as `£125.50`.

**Decision:** A single `formatPrice(pence: number): string` utility function handles all formatting. Applied only at render time, never stored as a formatted string.

**Consequences:** ✓ No risk of formatted strings being passed back to the API. ✓ Easy to change currency symbol or formatting rules in one place.

---

### DDR-003: No `dangerouslySetInnerHTML`

**Context:** Flight names, airport names, and booking references are rendered from API responses.

**Decision:** All API-sourced strings are rendered as React text nodes only. `dangerouslySetInnerHTML` is never used anywhere in the frontend.

**Consequences:** ✓ XSS risk from API responses is eliminated. ✓ React's default escaping applies to all dynamic content.

---

*Document controlled under the MikunAir Frontend documentation governance.*  
*Next review: triggered by any new route, new component, or API contract change.*
