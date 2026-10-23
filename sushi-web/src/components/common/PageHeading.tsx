import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PageHeading({ title, description }: { title: string; description?: string }) {
  const { t } = useTranslation();
  return (
    <div className="page-heading">
      <Link to="/menu" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        {t('common.menu')}
      </Link>
      <h1>{title}</h1>
      {description && <p className="muted">{description}</p>}
    </div>
  );
}
