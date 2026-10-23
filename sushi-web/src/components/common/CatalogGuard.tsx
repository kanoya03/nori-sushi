import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useCatalogStore } from '../../store/catalogStore';

export function CatalogGuard({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { status, load } = useCatalogStore();
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="panel loading-panel" role="status">
        {t('common.loading')}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="panel error-state" role="alert">
        <p>{t('catalog.errorText')}</p>
        <button className="button button-dark" type="button" onClick={() => void load()}>
          {t('common.retry')}
        </button>
      </div>
    );
  }
  return children;
}
