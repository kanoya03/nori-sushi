import { Grid2X2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { getCategoryName } from '../../utils/productLocalization';
import type { Category } from '../../api/categoriesApi';

type Props = {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
};

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);

  return (
    <div className="category-filter" role="group" aria-label={t('catalog.categories')}>
      <button
        type="button"
        className="category-chip"
        aria-pressed={!selected}
        onClick={() => onSelect(null)}
      >
        <Grid2X2 size={16} aria-hidden="true" />
        {t('catalog.all')}
      </button>
      {categories.map((category) => (
        <button
          type="button"
          key={category.id}
          className="category-chip"
          aria-pressed={selected === category.slug}
          onClick={() => onSelect(category.slug)}
        >
          {getCategoryName(category, language)}
        </button>
      ))}
    </div>
  );
}
