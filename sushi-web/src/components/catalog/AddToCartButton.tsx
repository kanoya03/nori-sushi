import { useEffect, useRef, useState } from 'react';
import { Check, Plus, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/cartStore';
import { useLanguageStore } from '../../store/languageStore';
import { getProductName } from '../../utils/productLocalization';
import type { Product } from '../../types/product';

export function AddToCartButton({
  product,
  quantity = 1,
  compact = false,
}: {
  product: Product;
  quantity?: number;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const add = useCartStore((state) => state.add);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function handleAdd() {
    add(product.id, quantity);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 800);
  }
  return (
    <>
      <span className="cart-add-feedback" role="status">
        {compact && added ? t('cartFeedback.added') : ''}
      </span>
      <button
        type="button"
        className={compact ? 'quick-add' : 'button button-accent'}
        onClick={handleAdd}
        aria-label={t(added ? 'cart.addedNamed' : 'cart.addNamed', {
          name: getProductName(product, language),
        })}
      >
        {added ? (
          <Check size={19} aria-hidden="true" />
        ) : compact ? (
          <Plus size={20} aria-hidden="true" />
        ) : (
          <ShoppingBag size={18} aria-hidden="true" />
        )}
        {!compact && t(added ? 'cart.added' : 'cart.add')}
      </button>
    </>
  );
}
