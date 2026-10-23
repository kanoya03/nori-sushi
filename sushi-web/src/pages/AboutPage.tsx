import { ArrowRight, Heart, MapPin, Menu as MenuIcon, ReceiptText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '../components/common/PageHeading';

const features = [
  { key: 'menu', to: '/menu', icon: MenuIcon },
  { key: 'favorites', to: '/favorites', icon: Heart },
  { key: 'orders', to: '/orders', icon: ReceiptText },
  { key: 'delivery', to: '/delivery', icon: MapPin },
] as const;

export function AboutPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeading title={t('about.title')} description={t('about.brandSubtitle')} />
      <section className="about-brand panel">
        <div className="about-brand-mark">
          <span>N</span>
          <i>.</i>
        </div>
        <div>
          <p className="eyebrow">NORI SUSHI</p>
          <h2>{t('about.aboutTitle')}</h2>
          <p>{t('about.paragraphOne')}</p>
          <p>{t('about.paragraphTwo')}</p>
        </div>
      </section>
      <section className="about-features" aria-labelledby="about-features-title">
        <div className="portfolio-section-heading">
          <div>
            <p className="eyebrow">NORI SUSHI</p>
            <h2 id="about-features-title">{t('about.features')}</h2>
          </div>
        </div>
        <div className="about-feature-grid">
          {features.map(({ key, to, icon: Icon }) => (
            <Link className="panel about-feature" to={to} key={key}>
              <span className="about-feature-icon">
                <Icon size={21} aria-hidden="true" />
              </span>
              <span>
                <strong>{t(`about.${key}`)}</strong>
                <small>{t(`about.${key}Description`)}</small>
              </span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
      <section className="about-demo panel">
        <span className="demo-symbol">
          <Sparkles size={21} aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">{t('about.demoLabel')}</p>
          <h2>{t('about.demoTitle')}</h2>
          <p>{t('about.demoText')}</p>
        </div>
        <span className="version-tag">{t('about.version')}</span>
      </section>
      <Link to="/menu" className="button button-dark about-menu-cta">
        {t('about.goToMenu')}
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </>
  );
}
