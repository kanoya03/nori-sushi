import { Heart, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { getProductName } from '../../utils/productLocalization';
import type { Product } from '../../types/product';

export function FavoriteButton({ product }: { product: Product }) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const authStatus = useAuthStore((state) => state.status);
  const { ids, status, pending, toggle } = useFavoritesStore();
  const selected = ids.includes(product.id);
  const busy = pending.includes(product.id);
  return (
    <button
      type="button"
      className="favorite-button"
      aria-pressed={selected}
      disabled={busy || status !== 'ready' || !['guest', 'authenticated'].includes(authStatus)}
      aria-label={t(selected ? 'favorites.removeNamed' : 'favorites.addNamed', {
        name: getProductName(product, language),
      })}
      onClick={() => void toggle(product.id)}
    >
      {busy ? (
        <LoaderCircle className="spin" size={19} aria-hidden="true" />
      ) : (
        <Heart size={20} fill={selected ? 'currentColor' : 'none'} aria-hidden="true" />
      )}
    </button>
  );
}
