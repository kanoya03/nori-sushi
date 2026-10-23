import { useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';
import { useAppSession } from '../../hooks/useAppSession';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export function AppLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  useAppSession();
  const favorites = useFavoritesStore();
  const cartStorageError = useCartStore((state) => state.storageError);
  const expired = useAuthStore((state) => state.expired);
  const authStatus = useAuthStore((state) => state.status);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell" id="top">
      <a className="skip-link" href="#main">
        {t('common.skip')}
      </a>
      <Header />
      <main id="main" className="container main-content" tabIndex={-1}>
        {expired && (
          <div className="notice" role="status">
            {t('auth.expired')}{' '}
            <Link to="/profile" className="text-link">
              {t('auth.signIn')}
            </Link>
          </div>
        )}
        {authStatus === 'error' && pathname !== '/profile' && (
          <div className="notice notice-error" role="alert">
            {t('auth.restoreError')}{' '}
            <Link to="/profile" className="text-link">
              {t('profile.title')}
            </Link>
          </div>
        )}
        {(favorites.status === 'error' || favorites.mutationError) && (
          <div className="notice notice-error" role="alert">
            <span>
              {t(favorites.mutationError ? 'favorites.updateError' : 'favorites.loadError')}
            </span>
            <button type="button" className="text-button" onClick={() => void favorites.load()}>
              {t('common.retry')}
            </button>
          </div>
        )}
        {(favorites.storageError || cartStorageError) && (
          <div className="notice" role="alert">
            {t('common.storageError')}
          </div>
        )}
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <Link to="/">
              NORI SUSHI<span className="brand-dot">.</span>
            </Link>
            <p>{t('footer.tagline')}</p>
          </div>
          <span className="footer-note">{t('footer.note')}</span>
          <a className="back-to-top" href="#top">
            {t('footer.backToTop')}
            <ArrowUp size={16} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
