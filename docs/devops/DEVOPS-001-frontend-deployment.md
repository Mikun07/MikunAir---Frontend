# Frontend DevOps & Deployment Strategy

**Service:** MikunAir Frontend SPA  
**Version:** v1.0.0  
**Status:** Approved  
**Date:** 2026-04-26  
**Author:** Festus-Olaleye Ayomikun  
**Depends On:** QUALITY-001-frontend-testing-strategy.md

---

## 1. Operational Requirements

### Availability
- Target: 99.5% uptime (NFR-002)
- Frontend is a static SPA served by nginx; near-zero operational risk once deployed

### Performance
- Lighthouse ≥ 80 on mobile (NFR-008)
- Static assets served with long-lived cache headers; nginx handles compression

### Accessibility
- WCAG 2.1 AA verified in CI on every push (NFR-006)
- Zero axe-core critical violations required to merge

---

## 2. Environment Strategy

### Development
- **Purpose:** Local feature development
- **Infrastructure:** Vite dev server (HMR)
- **Access:** Developer only (localhost:5173)
- **API target:** `http://localhost:3000` (backend dev server)
- **Start:** `npm run dev`

### Staging
- **Purpose:** Pre-production validation, E2E test execution
- **Infrastructure:** Docker container (nginx serving Vite build)
- **Access:** Developer only (no public access)
- **API target:** Staging backend URL (injected via `VITE_API_URL` build arg)
- **Deploy:** Automated on push to `main` after CI passes

### Production
- **Purpose:** Live portfolio demonstration
- **Infrastructure:** Azure Static Web Apps (free tier) or nginx container on Azure Container Apps
- **Access:** Public
- **API target:** Production backend URL (injected via `VITE_API_URL` at build time)
- **Deploy:** Automated on git tag `vX.Y.Z`

---

## 3. Docker Strategy

The frontend Dockerfile has two named stages:

| Stage | Base Image | Purpose |
|---|---|---|
| `builder` | `node:20-alpine` | `npm ci` + `npm run build` → `/app/dist` |
| `serve` | `nginx:alpine` | Serve `dist/` as static files with custom `nginx.conf` |

**nginx configuration:**
- Serves `index.html` for all routes (SPA fallback)
- Gzip compression enabled
- Long-lived cache headers on `/assets/` (content-hashed filenames from Vite)
- `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` headers

```bash
# Build production image
docker build --target serve -t mikunair-frontend:prod .
docker run -p 80:80 mikunair-frontend:prod
```

---

## 4. Build Configuration

Environment variables are injected at **build time** via Vite (`VITE_` prefix).

| Variable | Development | Staging | Production |
|---|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Staging backend URL | Production backend URL |
| `VITE_APP_VERSION` | `development` | Git SHA | Git tag |

**Rule:** No secrets are ever needed in the frontend. `VITE_API_URL` is a public URL. No API keys, no tokens, no passwords exist in the frontend build.

```bash
# Production build
VITE_API_URL=https://api.mikunair.com npm run build
```

---

## 5. CI/CD Pipeline

### Continuous Integration

Defined in `.github/workflows/ci.yml`. Triggered on every push and pull request.

```
Step 1:  Checkout code
Step 2:  Setup Node.js 20 + npm cache
Step 3:  npm ci (install dependencies)
Step 4:  TypeScript type check (tsc --noEmit)
Step 5:  ESLint (zero errors including react/no-danger)
Step 6:  Unit + component tests with Vitest (coverage ≥ 80%)
Step 7:  Accessibility scan (axe-core via Vitest — zero critical violations)
Step 8:  npm audit --audit-level=high
Step 9:  npm run build (verify Vite build succeeds)
Step 10: Lighthouse CI (Performance ≥ 80 on mobile)
Step 11: Docker build --target serve (verify image builds)
```

All steps must pass. Any failure blocks the PR.

### Continuous Delivery

Triggered on push to `main` after CI passes:

```
Step 1:  CI pipeline — must pass
Step 2:  Docker build + push to Azure Container Registry
Step 3:  Deploy to Staging
Step 4:  Run Playwright E2E tests against staging (all 5 journeys)
Step 5:  Lighthouse CI against staging
Step 6:  Notify: pass or fail
```

### Continuous Deployment

Triggered on git tag `vX.Y.Z`:

```
Step 1:  CD pipeline — must pass
Step 2:  Deploy to Production
Step 3:  Smoke test: E2E-001 (one-way guest booking) against production
```

---

## 6. Static Asset Strategy

Vite generates content-hashed filenames for all JS, CSS, and asset files:

```
dist/
├── index.html                    (no cache — always fresh)
├── assets/
│   ├── index-[hash].js          (cache 1 year)
│   ├── index-[hash].css         (cache 1 year)
│   └── vendor-[hash].js         (cache 1 year)
```

nginx cache headers:
- `index.html`: `Cache-Control: no-cache` (always check for updates)
- `/assets/*`: `Cache-Control: public, max-age=31536000, immutable`

This means deployments are instant — users get new assets on next page load because `index.html` is always fetched fresh.

---

## 7. Security Headers (nginx)

All responses from the frontend nginx server include:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; connect-src 'self' <VITE_API_URL>; ...
```

CSP is configured to allow connections only to `VITE_API_URL`. No inline scripts permitted.

---

## 8. Monitoring

### Availability
- Azure Static Web Apps / Container Apps provide uptime monitoring and restart policies
- Frontend nginx health check: `GET /` → 200

### Performance Monitoring
- Lighthouse CI runs on every `main` push; regression alerts if score drops below threshold
- Real User Monitoring (future): Azure Application Insights SDK injection

### Error Monitoring (future)
- Uncaught React errors captured by ErrorBoundary component
- Errors logged to console in development; forwarded to Azure Application Insights in production

---

## 9. Cost Analysis

| Resource | Tier | Estimated Monthly Cost |
|---|---|---|
| Azure Static Web Apps | Free tier (100GB bandwidth) | £0 |
| Azure Container Registry (shared with backend) | Basic | £0 (shared) |
| **Total frontend** | | **£0** |

The frontend is entirely static — no compute cost once deployed to Azure Static Web Apps.

---

*Document controlled under the MikunAir Frontend documentation governance.*  
*Next review: triggered by any infrastructure change, new CI step, or Lighthouse regression.*
