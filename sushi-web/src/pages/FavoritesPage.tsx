import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useCatalogStore } from '../store/catalogStore';
import { ProductCard } from '../components/catalog/ProductCard';
import { CatalogGuard } from '../components/common/CatalogGuard';
import { PageHeading } from '../components/common/PageHeading';

export function FavoritesPage() {
  const { t } = useTranslation();
  const authStatus = useAuthStore((state) => state.status);
  const { ids, status } = useFavoritesStore();
  const products = useCatalogStore((state) => state.products);
  const favorites = products.filter((product) => ids.includes(product.id));
  const waiting =
    ['idle', 'restoring', 'authenticating'].includes(authStatus) || status === 'loading';
  return (
    <>
      <PageHeading
        title={t('favorites.title')}
        description={t(
          authStatus === 'authenticated' ? 'favorites.accountNote' : 'favorites.guestNote',
        )}
      />
      {authStatus === 'guest' && (
        <p className="page-note">
          <Link className="text-link" to="/profile">
            {t('favorites.signIn')}
          </Link>
        </p>
      )}
      {waiting ? (
        <div className="panel loading-panel" role="status">
          {t('favorites.loading')}
        </div>
      ) : authStatus === 'error' ? (
        <div className="panel">
          <p>{t('auth.restoreError')}</p>
          <Link className="button button-dark" to="/profile">
            {t('profile.title')}
          </Link>
        </div>
      ) : (
        status !== 'error' && (
          <CatalogGuard>
            {favorites.length ? (
              <div className="product-grid">
                {favorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="catalog-state">
                <span className="state-icon">
                  <Heart size={32} aria-hidden="true" />
                </span>
                <h2>{t('favorites.empty')}</h2>
                <p>{t('favorites.emptyText')}</p>
                <Link className="button button-dark" to="/menu">
                  {t('common.menu')}
                </Link>
              </div>
            )}
          </CatalogGuard>
        )
      )}
    </>
  );
}
