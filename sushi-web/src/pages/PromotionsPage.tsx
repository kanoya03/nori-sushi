import { ArrowRight, Gift, Percent, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '../components/common/PageHeading';
import { useLanguageStore } from '../store/languageStore';
import { formatPrice } from '../utils/formatters';

const offers = [
  { key: 'first', icon: Percent, badge: '-15%' },
  { key: 'second', icon: Truck, badge: 'free' },
  { key: 'third', icon: Gift, badge: 'gift' },
] as const;

export function PromotionsPage() {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  return (
    <>
      <PageHeading title={t('promotions.title')} description={t('promotions.heroText')} />
      <section className="promotions-hero panel" aria-labelledby="promotions-intro">
        <div className="promotions-hero-icon">
          <Percent size={27} aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">NORI SUSHI</p>
          <h2 id="promotions-intro">{t('promotions.heroTitle')}</h2>
          <p>{t('promotions.heroText')}</p>
        </div>
        <Link to="/menu" className="button button-white">
          {t('promotions.openMenu')}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
      <div className="promotions-section-heading">
        <div>
          <p className="eyebrow">03 / NORI</p>
          <h2>{t('promotions.available')}</h2>
        </div>
        <span className="demo-pill">{t('promotions.demoLabel')}</span>
      </div>
      <div className="promotion-grid">
        {offers.map(({ key, icon: Icon, badge }) => (
          <article className="panel promotion-card" key={key}>
            <div className="promotion-card-top">
              <span className="promotion-icon">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="promotion-badge">
                {badge === 'free'
                  ? t('promotions.freeBadge')
                  : badge === 'gift'
                    ? t('promotions.giftBadge')
                    : badge}
              </span>
            </div>
            <h3>{t(`promotions.${key}.title`)}</h3>
            <p>
              {key === 'second'
                ? t('promotions.second.description', { amount: formatPrice(10000, language) })
                : t(`promotions.${key}.description`)}
            </p>
            <Link to="/menu" className="text-link">
              {t(`promotions.${key}.button`)}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
      <p className="promotion-disclaimer" role="note">
        {t('promotions.demoNotice')}
      </p>
    </>
  );
}
