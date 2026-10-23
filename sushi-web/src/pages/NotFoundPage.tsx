import { ArrowRight, Soup } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="catalog-state not-found">
      <span className="state-icon">
        <Soup size={38} strokeWidth={1.3} aria-hidden="true" />
      </span>
      <p className="eyebrow">404</p>
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.description')}</p>
      <Link to="/menu" className="button button-dark">
        {t('notFound.action')}
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}
