import { useLanguageStore } from '../../store/languageStore';
import {
  getProductCategoryName,
  getProductDescription,
  getProductName,
} from '../../utils/productLocalization';
import { formatPrice, formatWeight } from '../../utils/formatters';
import type { Product } from '../../types/product';
import { ProductImage } from './ProductImage';
import { Link } from 'react-router-dom';
import { FavoriteButton } from './FavoriteButton';
import { AddToCartButton } from './AddToCartButton';

export function ProductCard({ product }: { product: Product }) {
  const language = useLanguageStore((state) => state.language);
  const name = getProductName(product, language);

  return (
    <article className="product-card" aria-labelledby={`product-${product.id}`}>
      <div className="product-photo">
        <ProductImage src={product.image} alt={name} />
        <span className="product-category">{getProductCategoryName(product, language)}</span>
        <FavoriteButton product={product} />
      </div>
      <div className="product-content">
        <h3 id={`product-${product.id}`}>
          <Link className="product-detail-link" to={`/products/${product.id}`}>
            {name}
          </Link>
        </h3>
        <p className="product-description">{getProductDescription(product, language)}</p>
        <div className="product-footer">
          <strong className="product-price">{formatPrice(product.price, language)}</strong>
          <span className="product-weight">{formatWeight(product.weight, language)}</span>
        </div>
        <div className="product-actions">
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
