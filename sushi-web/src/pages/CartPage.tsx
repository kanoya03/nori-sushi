import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cartStore';
import { useCatalogStore } from '../store/catalogStore';
import { useLanguageStore } from '../store/languageStore';
import { getCartLines, getSubtotal } from '../utils/cart';
import { getProductName } from '../utils/productLocalization';
import { formatPrice, formatWeight } from '../utils/formatters';
import { ProductImage } from '../components/catalog/ProductImage';
import { QuantityControl } from '../components/cart/QuantityControl';
import { CatalogGuard } from '../components/common/CatalogGuard';
import { PageHeading } from '../components/common/PageHeading';

export function CartPage() {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const { entries, add, decrease, remove, clear } = useCartStore();
  const products = useCatalogStore((state) => state.products);
  const lines = getCartLines(entries, products);
  const unavailable = lines.some((line) => !line.product);

  return (
    <>
      <PageHeading title={t('cart.title')} description={t('cart.description')} />
      {!entries.length ? (
        <div className="catalog-state">
          <span className="state-icon">
            <ShoppingBag size={32} aria-hidden="true" />
          </span>
          <h2>{t('cart.empty')}</h2>
          <p>{t('cart.emptyText')}</p>
          <Link className="button button-dark" to="/menu">
            {t('common.menu')}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <CatalogGuard>
          <div className="cart-layout">
            <div className="cart-items">
              {lines.map(({ productId, product, quantity }) => {
                const name = product
                  ? getProductName(product, language)
                  : t('cart.unavailableItem', { id: productId });
                return (
                  <article className="cart-line" key={productId} aria-label={name}>
                    <div className="cart-image">
                      {product ? (
                        <Link to={`/products/${productId}`}>
                          <ProductImage src={product.image} alt={name} />
                        </Link>
                      ) : (
                        <ShoppingBag aria-hidden="true" />
                      )}
                    </div>
                    <div className="cart-product-info">
                      <h2>{product ? <Link to={`/products/${productId}`}>{name}</Link> : name}</h2>
                      {product && (
                        <p className="muted">
                          {formatWeight(product.weight, language)} ·{' '}
                          {formatPrice(product.price, language)}
                        </p>
                      )}
                      {!product && <p className="inline-error">{t('cart.unavailable')}</p>}
                    </div>
                    {product && (
                      <QuantityControl
                        quantity={quantity}
                        name={name}
                        increase={() => add(productId)}
                        decrease={() => decrease(productId)}
                      />
                    )}
                    <div className="cart-line-total">
                      {product && (
                        <strong>{formatPrice(product.price * quantity, language)}</strong>
                      )}
                      <button
                        type="button"
                        className="remove-item"
                        aria-label={t('cart.removeNamed', { name })}
                        onClick={() => remove(productId)}
                      >
                        <Trash2 size={17} aria-hidden="true" />
                        <span>{t('cart.remove')}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
              <button type="button" className="text-button" onClick={clear}>
                {t('cart.clear')}
              </button>
            </div>
            <aside className="panel cart-summary" aria-labelledby="cart-summary-title">
              <h2 id="cart-summary-title">{t('cart.summary')}</h2>
              <div className="subtotal-row">
                <span>{t('cart.subtotal')}</span>
                <strong data-testid="cart-subtotal">
                  {formatPrice(getSubtotal(lines), language)}
                </strong>
              </div>
              {unavailable && <p className="inline-error">{t('cart.unavailableNotice')}</p>}
              <div className="cart-summary-actions">
                <Link to="/checkout" className="button button-dark">
                  {t('checkout.goToCheckout')}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link to="/menu" className="button button-light">
                  {t('cart.continue')}
                </Link>
              </div>
            </aside>
          </div>
        </CatalogGuard>
      )}
    </>
  );
}
