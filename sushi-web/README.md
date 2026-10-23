# NORI SUSHI Web

Responsive NORI SUSHI web application built with React, TypeScript, Vite, React Router, Zustand, i18next/react-i18next, lucide-react and Mapbox GL JS. It uses the existing NORI API and database; this app does not create a backend or database.

## Features

- Live product catalog and categories, product details, category filters and search
- Russian and English interface; KZT in Russian and display-only USD conversion (KZT ÷ 460) in English
- Persistent browser cart, guest/account favorites and Google/Telegram sign-in
- Profile, delivery/pickup checkout, addresses, order history, order details and repeat/cancel actions when supported by the API
- Promotions and offer notifications presented as demo content; order updates are read from recent orders (no push infrastructure)
- About and delivery information pages, responsive navigation, loading/error/empty states and unavailable-image fallback

## Requirements and local development

Use Node.js 22.12+ (Node 24 recommended). From this directory:

```powershell
npm.cmd install
npm.cmd run dev
```

Vite normally serves `http://localhost:5173`. The default API URL is the existing deployed NORI backend. Optional values go in `.env.local` (copy `.env.example`) and require restarting Vite.

| Variable                | Required | Purpose                                                                                                        |
| ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`          | No       | Existing backend origin; defaults to `https://nori-sushi.onrender.com`                                         |
| `VITE_GOOGLE_CLIENT_ID` | No       | Public Google Web OAuth client ID that matches the backend's `GOOGLE_WEB_CLIENT_ID` audience                   |
| `VITE_MAPBOX_TOKEN`     | No       | Restricted public Mapbox `pk.` token for interactive map selection; address entry remains available without it |

Every `VITE_*` value is exposed in the browser bundle. Never set database credentials, JWT secrets, Google client secrets, Telegram bot tokens or a private Mapbox token here.

## Google sign-in configuration

Use the same Google Web application client ID that the existing backend validates. Add `http://localhost`, `http://localhost:5173` and the final HTTPS site origin to its Authorized JavaScript origins. Set that ID in `VITE_GOOGLE_CLIENT_ID`. The frontend sends the Google Identity Services ID token to the existing `POST /auth/google` route. No credentials are included in this repository. Telegram sign-in uses the existing backend flow and needs no web-specific secret.

## Checks

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run build
npm.cmd run preview
```

`npm.cmd run check` checks formatting, runs ESLint, typechecks the application, configuration and tests, and runs the unit tests. `npm.cmd run build` runs TypeScript checks and creates `dist/`.

Browser tests run on desktop and mobile viewports with mocked API responses. Install Playwright Chromium once with `npx.cmd playwright install chromium`, then run `npm.cmd run test:e2e`. On Windows with Edge installed, use `$env:PLAYWRIGHT_CHANNEL = 'msedge'` before the test command. Browser tests use their own Google test client ID and disable Mapbox, so local credentials do not affect the results.

## Code style

Prettier handles TypeScript, JSX, CSS, JSON and Markdown formatting: two-space indentation, single quotes, trailing commas and LF line endings. `.editorconfig` supplies the same indentation and encoding settings to editors. ESLint checks TypeScript, React hook dependencies and Fast Refresh exports.

```powershell
npm.cmd run format
npm.cmd run lint:fix
```

Run `npm.cmd run check` before committing. Checkout fields, payment options and the order summary live in `components/checkout`. Order history and notifications share `hooks/useOrders`, which cancels obsolete requests when the session changes or the page unmounts.

## Production deployment

This is a static Vite SPA; no deployment has been performed. Build from `sushi-web` after setting the production environment values. Configure the host to serve `dist/` and rewrite unknown paths (for example `/orders/123`) to `/index.html` so React Router can handle direct links. Serve over HTTPS. Add the production web origin to the Google OAuth client's authorized JavaScript origins and ensure the existing API allows that origin through CORS. Restrict the public Mapbox token to the production domain and only the APIs required by the map. Changing any `VITE_*` variable requires a fresh build.

The Promotions page mirrors app demo offers but does not represent live promotion eligibility or alter checkout pricing. Notifications show current order statuses and a demo offer link; there is no push notification service. Orders and totals remain governed by the existing backend. Before launch, set the intended Google and Mapbox configuration, verify the production API origin/CORS and Google sign-in with real accounts, and confirm the deployed routes and checkout flow. The app is ready for a deployment preview after this configuration; those external integration checks remain manual.

## Project structure

```text
src/
  api/             Existing API client and catalog/auth/commerce endpoints
  app/             Route definitions
  components/      Catalog, auth, cart, checkout and shared layout
  hooks/           Session initialization and order loading
  i18n/            English and Russian translations
  lib/             Browser storage and external SDK integration
  pages/           Catalog, search, product, cart, checkout, orders and info pages
  store/           Catalog, auth, language, favorites and cart state
  styles/          Shared, account, commerce and portfolio responsive styles
  types/           API and domain types
  utils/           Cart calculations, formatting and product localization
tests/              Unit and desktop/mobile Playwright tests
```
