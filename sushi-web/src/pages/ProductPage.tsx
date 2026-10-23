import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { getProductById } from '../api/productsApi';
import { ApiError } from '../api/client';
import { useCatalogStore } from '../store/catalogStore';
import { useLanguageStore } from '../store/languageStore';
import type { Product } from '../types/product';
import {
  getProductCategoryName,
  getProductDescription,
  getProductName,
} from '../utils/productLocalization';
import { formatPrice, formatWeight } from '../utils/formatters';
import { ProductImage } from '../components/catalog/ProductImage';
import { AddToCartButton } from '../components/catalog/AddToCartButton';
import { FavoriteButton } from '../components/catalog/FavoriteButton';
import { QuantityControl } from '../components/cart/QuantityControl';

export function ProductPage() {
  const { id = '' } = useParams();
  return <ProductDetails key={id} id={id} />;
}

function ProductDetails({ id }: { id: string }) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<'missing' | 'network' | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      setError('missing');
      return;
    }
    const controller = new AbortController();
    setError(null);
    void getProductById(Number(id), controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        setProduct(result);
        useCatalogStore.getState().updateProduct(result);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof ApiError && reason.status === 404 ? 'missing' : 'network');
        }
      });
    return () => controller.abort();
  }, [id, attempt]);

  if (error) {
    return (
      <div className="catalog-state error-state" role="alert">
        <h1>{t(error === 'missing' ? 'product.notFound' : 'catalog.errorTitle')}</h1>
        <p>{t(error === 'missing' ? 'product.notFoundText' : 'catalog.errorText')}</p>
        {error === 'network' && (
          <button
            className="button button-dark"
            type="button"
            onClick={() => setAttempt(attempt + 1)}
          >
            {t('common.retry')}
          </button>
        )}
        <Link className="back-link" to="/menu">
          {t('common.menu')}
        </Link>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="panel loading-panel" role="status">
        {t('product.loading')}
      </div>
    );
  }
  const name = getProductName(product, language);

  return (
    <>
      <Link to="/menu" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        {t('common.menu')}
      </Link>
      <div className="product-details">
        <div className="detail-image">
          <ProductImage src={product.image} alt={name} priority />
          <FavoriteButton product={product} />
        </div>
        <div className="detail-content">
          <p className="eyebrow">{getProductCategoryName(product, language)}</p>
          <h1>{name}</h1>
          <span className="detail-weight">{formatWeight(product.weight, language)}</span>
          <p className="detail-description">{getProductDescription(product, language)}</p>
          <strong className="detail-price">{formatPrice(product.price, language)}</strong>
          <p className="muted">{t('product.serving')}</p>
          <div className="detail-actions">
            <QuantityControl
              quantity={quantity}
              name={name}
              minimum={1}
              increase={() => setQuantity(quantity + 1)}
              decrease={() => setQuantity(quantity - 1)}
            />
            <AddToCartButton product={product} quantity={quantity} />
          </div>
          <Link to="/cart" className="text-link">
            {t('cart.view')}
          </Link>
        </div>
      </div>
    </>
  );
}
