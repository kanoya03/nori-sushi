import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { CatalogPage } from '../pages/CatalogPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { ProfilePage } from '../pages/ProfilePage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AddressBookPage } from '../pages/AddressBookPage';
import { OrdersPage } from '../pages/OrdersPage';
import { OrderDetailsPage } from '../pages/OrderDetailsPage';
import { PromotionsPage } from '../pages/PromotionsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AboutPage } from '../pages/AboutPage';
import { DeliveryInfoPage } from '../pages/DeliveryInfoPage';
import { SearchPage } from '../pages/SearchPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CatalogPage showHero />} />
        <Route path="menu" element={<CatalogPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="products/:id" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="addresses" element={<AddressBookPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="guest-orders/:id" element={<OrderDetailsPage guest />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="delivery" element={<DeliveryInfoPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
