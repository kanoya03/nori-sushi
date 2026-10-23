import {
  LogOut,
  UserRound,
  Heart,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  ClipboardList,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { disableGoogleAutoSelect } from '../lib/googleIdentity';
import { AuthPanel } from '../components/auth/AuthPanel';
import { PageHeading } from '../components/common/PageHeading';

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, status, restore, logout, storageError } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || t('profile.member')
    : t('profile.welcome');
  const date = (value: string | null) =>
    value && !Number.isNaN(Date.parse(value))
      ? new Date(value).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
          timeZone: 'UTC',
        })
      : '—';
  const signOut = () => {
    disableGoogleAutoSelect();
    logout();
  };

  return (
    <>
      <PageHeading title={t('profile.title')} description={t('profile.description')} />
      <div className="profile-layout">
        <aside className="profile-aside">
          <div className="panel profile-language">
            <label htmlFor="profile-language">{t('common.language')}</label>
            <select
              id="profile-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value === 'ru' ? 'ru' : 'en')}
            >
              <option value="ru">Русский · KZT</option>
              <option value="en">English · USD</option>
            </select>
          </div>
          <Link className="panel profile-shortcut" to="/favorites">
            <Heart size={19} aria-hidden="true" />
            {t('favorites.title')}
          </Link>
          <Link className="panel profile-shortcut" to="/cart">
            <ShoppingBag size={19} aria-hidden="true" />
            {t('cart.title')}
          </Link>
          <Link className="panel profile-shortcut" to="/addresses">
            <MapPin size={19} aria-hidden="true" />
            {t('address.title')}
          </Link>
          <Link className="panel profile-shortcut" to="/orders">
            <ClipboardList size={19} aria-hidden="true" />
            {t('orders.title')}
          </Link>
        </aside>
        {status === 'idle' || status === 'restoring' ? (
          <div className="panel loading-panel" role="status">
            {t('auth.restoring')}
          </div>
        ) : status === 'error' ? (
          <div className="panel" role="alert">
            <h2>{t('auth.restoreError')}</h2>
            <p className="muted">{t('auth.network')}</p>
            <div className="action-row">
              <button type="button" className="button button-dark" onClick={() => void restore()}>
                {t('common.retry')}
              </button>
              <button type="button" className="button button-light" onClick={signOut}>
                {t('profile.logout')}
              </button>
            </div>
          </div>
        ) : user ? (
          <section className="panel profile-card">
            <div className="profile-identity">
              <span className="profile-avatar">
                <UserRound size={32} aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow">NORI SUSHI</p>
                <h2>{fullName}</h2>
              </div>
            </div>
            <dl className="profile-fields">
              <div>
                <dt>{t('profile.email')}</dt>
                <dd>{user.email || t('profile.notProvided')}</dd>
              </div>
              <div>
                <dt>{t('profile.birthday')}</dt>
                <dd>{date(user.birthDate)}</dd>
              </div>
              <div>
                <dt>{t('profile.memberSince')}</dt>
                <dd>{date(user.createdAt)}</dd>
              </div>
              <div>
                <dt>{t('profile.signInMethod')}</dt>
                <dd>
                  {[user.googleId && 'Google', user.telegramId && 'Telegram']
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </dd>
              </div>
            </dl>
            <p className="profile-session muted">
              <ShieldCheck size={16} aria-hidden="true" />
              {t('auth.sessionNote')}
            </p>
            {storageError && (
              <p role="alert" className="inline-error">
                {t('auth.storageError')}
              </p>
            )}
            <button type="button" className="button button-light" onClick={signOut}>
              <LogOut size={18} aria-hidden="true" />
              {t('profile.logout')}
            </button>
          </section>
        ) : (
          <AuthPanel />
        )}
      </div>
    </>
  );
}
