import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function CatalogLoading() {
  const { t } = useTranslation();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 8_000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="catalog-loading">
      <p className="loading-message" role="status">
        {t(slow ? 'catalog.slow' : 'common.loading')}
      </p>
      <div className="skeleton-categories" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span className="skeleton" key={i} />
        ))}
      </div>
      <div className="product-grid" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div className="product-card skeleton-card" key={i}>
            <div className="skeleton skeleton-photo" />
            <div className="product-content">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-price" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
