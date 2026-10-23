import { ArrowRight, MapPin, Store, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '../components/common/PageHeading';
import { PICKUP_POINTS } from '../constants/pickupPoints';
import { useLanguageStore } from '../store/languageStore';
import { formatPrice } from '../utils/formatters';

export function DeliveryInfoPage() {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  return (
    <>
      <PageHeading title={t('delivery.title')} description={t('delivery.description')} />
      <div className="delivery-info-grid">
        <section className="panel delivery-method-card">
          <span className="delivery-method-icon">
            <Truck size={22} />
          </span>
          <p className="eyebrow">01 / NORI</p>
          <h2>{t('delivery.deliveryTitle')}</h2>
          <p>{t('delivery.deliveryText')}</p>
          <dl>
            <div>
              <dt>{t('delivery.fee')}</dt>
              <dd>{formatPrice(700, language)}</dd>
            </div>
            <div>
              <dt>{t('delivery.minimum')}</dt>
              <dd>{formatPrice(5000, language)}</dd>
            </div>
          </dl>
          <Link to="/checkout" className="text-link">
            {t('delivery.startOrder')}
            <ArrowRight size={16} />
          </Link>
        </section>
        <section className="panel delivery-method-card">
          <span className="delivery-method-icon delivery-pickup-icon">
            <Store size={22} />
          </span>
          <p className="eyebrow">02 / NORI</p>
          <h2>{t('delivery.pickupTitle')}</h2>
          <p>{t('delivery.pickupText')}</p>
          <Link to="/checkout" className="text-link">
            {t('delivery.choosePickup')}
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <section className="delivery-points">
        <div className="portfolio-section-heading">
          <div>
            <p className="eyebrow">NORI SUSHI / MILANO</p>
            <h2>{t('delivery.locations')}</h2>
          </div>
        </div>
        <div className="pickup-info-grid">
          {PICKUP_POINTS.map((point) => (
            <article className="panel pickup-info-card" key={point.id}>
              <span>
                <MapPin size={19} aria-hidden="true" />
              </span>
              <div>
                <h3>{point.name}</h3>
                <p>{point.address}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <p className="demo-caption" role="note">
        {t('delivery.sourceNote')}
      </p>
    </>
  );
}
