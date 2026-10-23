import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MINIMUM_ORDER_KZT } from '../../constants/checkout';
import { useLanguageStore } from '../../store/languageStore';
import { getSubtotal, type CartLine } from '../../utils/cart';
import { formatPrice } from '../../utils/formatters';
import { getProductName } from '../../utils/productLocalization';
import { ProductImage } from '../catalog/ProductImage';

type Props = {
  lines: CartLine[];
  deliveryFee: number;
  submitting: boolean;
  submitDisabled: boolean;
  error: string;
};

export function CheckoutSummary({ lines, deliveryFee, submitting, submitDisabled, error }: Props) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const subtotal = getSubtotal(lines);
  const total = subtotal + deliveryFee;
  const minimumReached = subtotal >= MINIMUM_ORDER_KZT;

  return (
    <aside className="panel order-summary">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">NORI SUSHI</p>
          <h2>{t('checkout.summary')}</h2>
        </div>
        <span className="summary-count">{lines.reduce((sum, item) => sum + item.quantity, 0)}</span>
      </div>
      <div className="summary-lines">
        {lines.map(({ productId, product, quantity }) =>
          product ? (
            <div className="summary-product" key={productId}>
              <ProductImage src={product.image} alt={getProductName(product, language)} />
              <div>
                <strong>{getProductName(product, language)}</strong>
                <small>
                  {quantity} × {formatPrice(product.price, language)}
                </small>
              </div>
              <b>{formatPrice(product.price * quantity, language)}</b>
            </div>
          ) : (
            <p className="inline-error" key={productId}>
              {t('cart.unavailableItem', { id: productId })}
            </p>
          ),
        )}
      </div>
      <div className="summary-totals">
        <div>
          <span>{t('cart.subtotal')}</span>
          <strong>{formatPrice(subtotal, language)}</strong>
        </div>
        <div>
          <span>{t('checkout.deliveryFee')}</span>
          <strong>{deliveryFee ? formatPrice(deliveryFee, language) : t('checkout.free')}</strong>
        </div>
        <div className="summary-total">
          <span>{t('checkout.total')}</span>
          <strong>{formatPrice(total, language)}</strong>
        </div>
      </div>
      <p className={`minimum-note ${minimumReached ? 'minimum-ok' : ''}`}>
        {minimumReached
          ? t('checkout.minimumMet')
          : t('checkout.minimumHint', { amount: formatPrice(MINIMUM_ORDER_KZT, language) })}
      </p>
      {error && (
        <p role="alert" className="notice notice-error checkout-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="button button-dark checkout-submit"
        disabled={submitDisabled}
      >
        {submitting ? t('checkout.submitting') : t('checkout.placeOrder')}
        <ArrowRight size={17} />
      </button>
      <p className="server-price-note">{t('checkout.serverPriceNote')}</p>
      <Link className="text-link checkout-back" to="/cart">
        <ArrowLeft size={16} />
        {t('checkout.backToCart')}
      </Link>
    </aside>
  );
}
