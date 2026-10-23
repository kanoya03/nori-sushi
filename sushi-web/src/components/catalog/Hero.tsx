import { ArrowDownRight, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { getProductName } from '../../utils/productLocalization';
import { formatWeight } from '../../utils/formatters';
import type { Product } from '../../types/product';
import { ProductImage } from './ProductImage';

export function Hero({ product }: { product?: Product }) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <p className="eyebrow hero-eyebrow">
          <span />
          {t('hero.eyebrow')}
        </p>
        <h1 id="hero-title">{t('hero.title')}</h1>
        <p className="hero-description">{t('hero.description')}</p>
        <a className="button button-white" href="#catalog">
          {t('hero.action')}
          <ArrowDownRight size={19} aria-hidden="true" />
        </a>
      </div>
      <div className="hero-visual">
        <div className="hero-orbit" aria-hidden="true" />
        <div className="hero-feature">
          {product ? (
            <>
              <div className="hero-photo">
                <ProductImage
                  src={product.image}
                  alt={getProductName(product, language)}
                  priority
                />
              </div>
              <div className="hero-feature-caption">
                <span>{t('hero.featured')}</span>
                <strong>{getProductName(product, language)}</strong>
                <small>{formatWeight(product.weight, language)}</small>
              </div>
            </>
          ) : (
            <div className="hero-placeholder" aria-hidden="true">
              <Utensils size={64} strokeWidth={1} />
              <span>NORI SUSHI</span>
            </div>
          )}
        </div>
        <span className="hero-side-label" aria-hidden="true">
          NORI · SUSHI · NORI · SUSHI
        </span>
      </div>
    </section>
  );
}
