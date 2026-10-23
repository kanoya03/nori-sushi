import { useEffect, useRef, useState } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  ShoppingBag,
  Search,
  Heart,
  ReceiptText,
  UserRound,
  BadgePercent,
  Bell,
  Info,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useCartStore } from '../../store/cartStore';

export function Header() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const count = useCartStore((state) =>
    state.entries.reduce((sum, entry) => sum + entry.quantity, 0),
  );
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="wordmark" to="/" aria-label="NORI SUSHI" onClick={() => setOpen(false)}>
          <span>
            NORI<span className="brand-dot">.</span>
          </span>
          <span className="wordmark-caption">SUSHI</span>
        </Link>
        <nav
          id="main-navigation"
          className={`header-nav ${open ? 'is-open' : ''}`}
          aria-label={t('common.navigation')}
        >
          <NavLink to="/" end onClick={() => setOpen(false)}>
            {t('common.home')}
          </NavLink>
          <NavLink to="/menu" onClick={() => setOpen(false)}>
            <ArrowUpRight size={16} aria-hidden="true" />
            {t('common.menu')}
          </NavLink>
          <NavLink to="/search" onClick={() => setOpen(false)}>
            <Search size={16} aria-hidden="true" />
            {t('search.title')}
          </NavLink>
          <NavLink to="/favorites" onClick={() => setOpen(false)}>
            <Heart size={16} aria-hidden="true" />
            {t('favorites.title')}
          </NavLink>
          <NavLink to="/cart" onClick={() => setOpen(false)}>
            <ShoppingBag size={16} aria-hidden="true" />
            {t('cart.title')} {count > 0 && <span className="nav-count">{count}</span>}
          </NavLink>
          <NavLink to="/orders" onClick={() => setOpen(false)}>
            <ReceiptText size={16} aria-hidden="true" />
            {t('orders.title')}
          </NavLink>
          <NavLink to="/promotions" onClick={() => setOpen(false)}>
            <BadgePercent size={16} aria-hidden="true" />
            {t('promotions.title')}
          </NavLink>
          <NavLink to="/notifications" onClick={() => setOpen(false)}>
            <Bell size={16} aria-hidden="true" />
            {t('notifications.title')}
          </NavLink>
          <NavLink to="/profile" onClick={() => setOpen(false)}>
            <UserRound size={16} aria-hidden="true" />
            {t('profile.title')}
          </NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>
            <Info size={16} aria-hidden="true" />
            {t('about.title')}
          </NavLink>
        </nav>
        <div className="header-actions">
          <Link
            className="header-cart icon-button"
            to="/cart"
            aria-label={t('cart.navigationCount', { count })}
            onClick={() => setOpen(false)}
          >
            <ShoppingBag size={21} aria-hidden="true" />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          <span className="currency-label">{language === 'ru' ? 'KZT' : 'USD'}</span>
          <div className="language-switch" role="group" aria-label={t('common.language')}>
            <button
              type="button"
              lang="ru"
              aria-label="Русский"
              aria-pressed={language === 'ru'}
              onClick={() => setLanguage('ru')}
            >
              RU
            </button>
            <button
              type="button"
              lang="en"
              aria-label="English"
              aria-pressed={language === 'en'}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>
          <button
            ref={menuButton}
            className="icon-button mobile-menu-button"
            type="button"
            aria-label={t(open ? 'common.closeMenu' : 'common.openMenu')}
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
