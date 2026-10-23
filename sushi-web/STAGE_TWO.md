# Stage two implementation notes

## New files

All paths below are relative to `sushi-web/`.

| Area                | Files                                                                                                                        | Purpose                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| API contracts       | `src/api/authApi.ts`, `src/api/favoritesApi.ts`, `src/types/auth.ts`                                                         | Existing Google/Telegram/JWT and favorite routes, validated responses                    |
| State               | `src/store/authStore.ts`, `src/store/cartStore.ts`, `src/store/favoritesStore.ts`                                            | Session lifecycle, persistent cart, separate guest/server favorites, request race guards |
| Browser integration | `src/lib/storage.ts`, `src/lib/googleIdentity.ts`, `src/hooks/useAppSession.ts`                                              | Safe storage access, official Google SDK, session restore/expiry and focus refresh       |
| Pure logic          | `src/utils/cart.ts`, `src/utils/session.ts`                                                                                  | Mobile-compatible quantity/subtotal rules, storage validation, JWT expiry for UX         |
| Pages               | `src/pages/ProductPage.tsx`, `src/pages/CartPage.tsx`, `src/pages/FavoritesPage.tsx`, `src/pages/ProfilePage.tsx`            | Product details, cart, favorites, sign-in/profile                                        |
| Authentication UI   | `src/components/auth/AuthPanel.tsx`, `src/components/auth/GoogleSignIn.tsx`                                                  | Telegram link/code steps and Google button/error/configuration states                    |
| Catalog actions     | `src/components/catalog/AddToCartButton.tsx`, `src/components/catalog/FavoriteButton.tsx`                                    | Shared card/detail actions and feedback                                                  |
| Shared UI           | `src/components/cart/QuantityControl.tsx`, `src/components/common/CatalogGuard.tsx`, `src/components/common/PageHeading.tsx` | Accessible quantities, catalog readiness, page structure                                 |
| Styles              | `src/styles/account.css`                                                                                                     | Responsive product, cart, profile, auth, navigation, and action styling                  |
| Tests               | `tests/state.test.ts`, `tests/account.spec.ts`                                                                               | Cart/expiry unit tests and desktop/mobile integration tests                              |
| Documentation       | `STAGE_TWO.md`                                                                                                               | This inventory and manual verification guide                                             |

## Updated files

| Files                                              | Change                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/api/client.ts`                                | Central authenticated-401 handling, retaining existing error/timeout behavior |
| `src/api/productsApi.ts`                           | Product-by-ID requests and reusable API product validation                    |
| `src/store/catalogStore.ts`                        | Catalog refresh and updating a product from its details response              |
| `src/app/App.tsx`                                  | Product, Cart, Favorites, Profile routes                                      |
| `src/components/catalog/ProductCard.tsx`           | Accessible link covering the card, separate favorite and add buttons          |
| `src/components/layout/Header.tsx`                 | Favorites/Cart/Profile navigation and cart count                              |
| `src/components/layout/AppLayout.tsx`              | Session initialization and visible session/favorite/storage notices           |
| `src/i18n/locales/en.ts`, `src/i18n/locales/ru.ts` | Bilingual product, cart, profile, auth, and favorite states                   |
| `src/main.tsx`                                     | Import the new responsive styles                                              |
| `src/vite-env.d.ts`, `.env.example`                | Optional public Google client ID configuration                                |
| `package.json`                                     | Include new unit tests in `npm test`; no added dependencies                   |
| `playwright.config.ts`                             | Isolated test server on 5175 and test-only Google configuration               |
| `README.md`                                        | Setup, authentication/storage behavior, Google configuration, test commands   |
| `../README.md`                                     | Web stage-two feature summary                                                 |

The existing mobile product type, mapper, localization helpers, and formatters remain unchanged. No backend or mobile source files were edited.

## Manual verification

1. Start the web app as described in [README.md](README.md). Open a product card, check both languages, change the quantity, and add it to the cart. Check the navigation count and subtotal.
2. Reload `/cart`: quantities should remain; products and prices are fetched again. Decrease to zero or remove/clear items to reach the empty state.
3. Save a guest favorite, visit `/favorites`, and reload. The selection remains, with current catalog names/images/prices.
4. On `/profile`, try Telegram: start a session, open the bot, tap Start, enter the code. The code and bot interaction require your own Telegram account. Check profile data and reload to restore the session.
5. After configuring the existing Google Web client as described in README, sign in with Google's official button. A missing client ID leaves Google unavailable while Telegram still works.
6. While signed in, save/remove a favorite and verify the same account's favorites in the mobile app. Guest favorites are separate; sign out to return to them.
7. Switch language on Profile and check the catalog/cart. Test navigation at desktop, tablet, and phone widths.

Automated auth tests use mocked credentials/responses and do not establish a real Google or Telegram session. A real end-to-end provider login remains a manual test with your account and Google origin configuration.
