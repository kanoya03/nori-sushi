import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, RefreshCw, Search, Soup, WifiOff, X } from 'lucide-react';
import { useCatalogStore } from '../store/catalogStore';
import { filterProducts } from '../utils/filterProducts';
import { Hero } from '../components/catalog/Hero';
import { CategoryFilter } from '../components/catalog/CategoryFilter';
import { CatalogLoading } from '../components/catalog/CatalogLoading';
import { ProductCard } from '../components/catalog/ProductCard';

export function CatalogPage({
  showHero = false,
  searchMode = false,
}: {
  showHero?: boolean;
  searchMode?: boolean;
}) {
  const { t } = useTranslation();
  const { products, categories, status, error, load } = useCatalogStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || null;
  const query = searchParams.get('q') || '';
  const searchInput = useRef<HTMLInputElement>(null);
  const filtered = filterProducts(products, category, query);
  const hasFilters = Boolean(category || query.trim());
  const loading = status === 'idle' || status === 'loading';

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (searchMode && window.matchMedia('(min-width: 901px)').matches) {
      searchInput.current?.focus();
    }
  }, [searchMode]);

  function updateFilter(key: 'category' | 'q', value: string | null) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        return next;
      },
      { replace: key === 'q' },
    );
  }

  function resetFilters() {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('category');
      next.delete('q');
      return next;
    });
  }

  return (
    <>
      {showHero && <Hero product={products[0]} />}
      <section
        className={`catalog ${showHero ? '' : 'catalog-standalone'}`}
        id="catalog"
        aria-labelledby="catalog-title"
      >
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">{t(searchMode ? 'search.eyebrow' : 'catalog.eyebrow')}</p>
            {showHero ? (
              <h2 id="catalog-title">{t('catalog.title')}</h2>
            ) : (
              <h1 id="catalog-title">{t(searchMode ? 'search.title' : 'catalog.title')}</h1>
            )}
            <p className="section-description">
              {t(searchMode ? 'search.description' : 'catalog.description')}
            </p>
          </div>
          <div className="search-field" role="search">
            <Search size={19} aria-hidden="true" />
            <input
              ref={searchInput}
              type="search"
              aria-label={t('catalog.search')}
              placeholder={t('catalog.searchPlaceholder')}
              value={query}
              onChange={(event) => updateFilter('q', event.target.value)}
            />
            {query && (
              <button
                type="button"
                className="search-clear"
                aria-label={t('catalog.clearSearch')}
                onClick={() => updateFilter('q', null)}
              >
                <X size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {loading && <CatalogLoading />}
        {status === 'error' && (
          <div className="catalog-state error-state" role="alert">
            <span className="state-icon">
              <WifiOff size={30} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3>{t('catalog.errorTitle')}</h3>
            <p>{t(error === 'timeout' ? 'catalog.timeoutText' : 'catalog.errorText')}</p>
            <button type="button" className="button button-dark" onClick={() => void load()}>
              <RefreshCw size={17} aria-hidden="true" />
              {t('common.retry')}
            </button>
          </div>
        )}
        {status === 'success' && (
          <>
            {(!searchMode || query.trim()) && (
              <CategoryFilter
                categories={categories}
                selected={category}
                onSelect={(slug) => updateFilter('category', slug)}
              />
            )}
            {!(searchMode && !query.trim()) && (
              <div className="results-heading">
                <p role="status">{t('catalog.count', { count: filtered.length })}</p>
                {hasFilters && (
                  <button type="button" className="text-button" onClick={resetFilters}>
                    {t('catalog.reset')}
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
            {searchMode && !query.trim() ? (
              <div className="catalog-state search-start">
                <span className="state-icon">
                  <Search size={32} aria-hidden="true" />
                </span>
                <h3>{t('search.startTitle')}</h3>
                <p>{t('search.startText')}</p>
              </div>
            ) : filtered.length ? (
              <div className="product-grid">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="catalog-state">
                <span className="state-icon">
                  <Soup size={34} strokeWidth={1.3} aria-hidden="true" />
                </span>
                <h3>{t(hasFilters ? 'catalog.noResults' : 'catalog.emptyTitle')}</h3>
                <p>{t(hasFilters ? 'catalog.noResultsText' : 'catalog.emptyText')}</p>
                {hasFilters && (
                  <button type="button" className="button button-dark" onClick={resetFilters}>
                    {t('catalog.reset')}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
