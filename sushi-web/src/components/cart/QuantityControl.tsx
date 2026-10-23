import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function QuantityControl({
  quantity,
  name,
  increase,
  decrease,
  minimum = 0,
}: {
  quantity: number;
  name: string;
  increase: () => void;
  decrease: () => void;
  minimum?: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="quantity-control" role="group" aria-label={t('cart.quantityNamed', { name })}>
      <button
        type="button"
        aria-label={t('cart.decrease', { name })}
        onClick={decrease}
        disabled={quantity <= minimum}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <span>{quantity}</span>
      <button
        type="button"
        aria-label={t('cart.increase', { name })}
        onClick={increase}
        disabled={!Number.isSafeInteger(quantity + 1)}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
