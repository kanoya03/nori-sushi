import { useTranslation } from 'react-i18next';
import type { PaymentMethod } from '../../types/commerce';

type Props = {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
};

export function CheckoutPayment({
  paymentMethod,
  onPaymentMethodChange,
  comment,
  onCommentChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <section className="panel checkout-section">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">02 / {t('checkout.payment')}</p>
          <h2>{t('checkout.paymentTitle')}</h2>
        </div>
      </div>
      <div className="choice-row payment-options">
        <label
          className={`choice-card ${paymentMethod === 'CARD_ON_DELIVERY' ? 'is-selected' : ''}`}
        >
          <input
            type="radio"
            name="payment"
            value="CARD_ON_DELIVERY"
            checked={paymentMethod === 'CARD_ON_DELIVERY'}
            onChange={() => onPaymentMethodChange('CARD_ON_DELIVERY')}
          />
          <span>
            <strong>{t('checkout.cardOnDelivery')}</strong>
            <small>{t('checkout.cardHint')}</small>
          </span>
        </label>
        <label className={`choice-card ${paymentMethod === 'CASH' ? 'is-selected' : ''}`}>
          <input
            type="radio"
            name="payment"
            value="CASH"
            checked={paymentMethod === 'CASH'}
            onChange={() => onPaymentMethodChange('CASH')}
          />
          <span>
            <strong>{t('checkout.cash')}</strong>
            <small>{t('checkout.cashHint')}</small>
          </span>
        </label>
      </div>
      <label className="comment-field">
        {t('checkout.comment')}
        <textarea
          maxLength={300}
          rows={3}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder={t('checkout.commentPlaceholder')}
        />
        <small>{comment.length}/300</small>
      </label>
    </section>
  );
}
