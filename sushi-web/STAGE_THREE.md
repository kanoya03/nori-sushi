# Stage three implementation notes

## What was added

| Area              | Files                                                                                                                               | Purpose                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Backend contracts | `src/types/commerce.ts`, `src/api/commerceApi.ts`                                                                                   | Existing order/address response types and endpoint calls                                    |
| Checkout          | `src/pages/CheckoutPage.tsx`, `src/components/checkout/DeliveryMap.tsx`, `src/constants/pickupPoints.ts`, `src/styles/commerce.css` | Delivery or pickup, address selection, delivery map, reverse geocoding and order submission |
| Saved addresses   | `src/pages/AddressBookPage.tsx`                                                                                                     | Authenticated address list, create/edit/default/select; no delete control                   |
| Orders            | `src/pages/OrdersPage.tsx`, `src/pages/OrderDetailsPage.tsx`, `src/lib/guestOrders.ts`                                              | History, guest references, status and item details, cancellation and reorder                |
| Tests             | `tests/commerce.spec.ts`                                                                                                            | Mocked desktop/mobile guest, authenticated, address, pickup and order flows                 |

Updated `src/app/App.tsx` with `/checkout`, `/addresses`, `/orders`, `/orders/:id`, and `/guest-orders/:id`; added Orders navigation and Profile shortcuts; added checkout navigation to the cart; extended both locale files; imported responsive commerce styles; added `VITE_MAPBOX_TOKEN` to `.env.example` and `src/vite-env.d.ts`; and added the Mapbox GL JS dependency to `package.json` and `package-lock.json`.

## Reused rules and API behavior

- The mobile app and backend use a 5,000 KZT minimum, a 700 KZT delivery fee and no pickup fee. The web mirrors these figures for display and validation. The backend independently checks the minimum and calculates fees.
- Russian displays KZT; English displays the existing fixed conversion of 460 KZT per USD. These are display values.
- Order submission follows the existing DTO: delivery type, payment method, address string, optional comment, and product IDs with quantities. The client sends no prices or totals. The backend validates product availability and calculates line prices, subtotal, fee and total.
- Pickup names, addresses and coordinates match `sushi-delivery/src/constants/pickupPoints.ts`.
- Authenticated address operations call `GET/POST /addresses` and `PATCH /addresses/:id`. Users can create, edit, set the default by backend behavior, and select addresses. Delete is not exposed. Guests enter a delivery address for the current order only.
- Authenticated orders use `GET /orders`, `GET /orders/:id`, `POST /orders`, and `PATCH /orders/:id/cancel`. Guest routes use `/orders/guest` and `/orders/guest/:id?token=...`, matching the mobile API. Cancellation is offered only for pending and confirmed orders, the states accepted by the backend.
- Guest access tokens are held in `sessionStorage`, not persistent `localStorage`, and are not placed in app route/address-bar URLs. The existing backend requires the token on its guest detail/cancel API request, so it is sent as that request's query parameter. Guest details can be reopened in the same tab after reload. The backend has no guest-order list endpoint, so guest history is limited to references retained by that tab.
- Reorder matches order product IDs against the current live catalog. Removed or unavailable products are skipped.

## Environment and run instructions

Copy `.env.example` to `.env.local`. `VITE_API_URL` defaults to `https://nori-sushi.onrender.com`. Add `VITE_MAPBOX_TOKEN` to enable Mapbox map selection, a draggable marker, reverse geocoding and browser current-location support. Use a restricted public Mapbox `pk.…` token with map styles and Geocoding API access. The token is visible to browsers by design; never use a secret token. Without it, typed address checkout still works and the map displays a configuration hint. Geolocation needs user permission and a secure context (HTTPS or localhost).

`VITE_GOOGLE_CLIENT_ID` remains the optional public Web OAuth client ID configured for the existing backend. Do not put Neon credentials, JWT secrets, Telegram tokens or Google client secrets into Vite variables.

```powershell
cd sushi-web
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd test
$env:PLAYWRIGHT_CHANNEL = 'msedge' # or install Chromium once with npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Playwright runs on port 5175 and intercepts API requests, including writes. No real orders or address changes are made by the tests.

For manual backend testing, add catalog items until the subtotal is at least 5,000 KZT. Try guest delivery with typed address details, guest pickup at one of the listed Milan locations, and (after signing in with a real Google/Telegram account) a saved-address order. Review order detail and status, cancel while pending/confirmed, repeat an order, and create/edit a saved address at `/addresses`. Guest order details remain accessible in the same tab where checkout completed. Use HTTPS for Mapbox/geolocation outside localhost.

## API assumptions and limits

Inspection of the mobile app and current backend confirmed the endpoint paths and request shapes; no backend changes were required. An order stores an address snapshot string while saved addresses are separate records. Delivery fee/minimum are enforced server-side. Payment supports cash or card on delivery only. The backend returns the guest token with a successful guest order, and requires it as a query parameter for guest detail/cancellation. No checkout, order, address or user API change was made.
