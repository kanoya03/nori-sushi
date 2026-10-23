import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Pencil, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { createAddress, getAddresses, updateAddress } from '../api/commerceApi';
import { AddressFields } from '../components/checkout/AddressFields';
import { PageHeading } from '../components/common/PageHeading';
import { saveSelectedAddressId } from '../lib/selectedAddress';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import type { Address, AddressInput } from '../types/commerce';

const EMPTY_ADDRESS: AddressInput = {
  city: '',
  street: '',
  house: '',
  apartment: '',
  entrance: '',
  floor: '',
  comment: '',
};

export function AddressBookPage() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'restoring') {
    return (
      <div className="panel loading-panel" role="status">
        {t('auth.restoring')}
      </div>
    );
  }

  if (status !== 'authenticated' || !token) {
    return (
      <>
        <PageHeading title={t('address.title')} description={t('address.signIn')} />
        <Link className="button button-dark" to="/profile">
          {t('auth.signIn')}
        </Link>
      </>
    );
  }

  return <AddressBook key={token} token={token} />;
}

type AddressEditor = { mode: 'new' } | { mode: 'edit'; id: number };

function AddressBook({ token }: { token: string }) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = location.state?.returnTo === '/checkout' ? '/checkout' : '/profile';
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<AddressInput>(EMPTY_ADDRESS);
  const [editor, setEditor] = useState<AddressEditor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setLoading(true);
    setLoadError(false);

    async function load() {
      try {
        const result = await getAddresses(token, signal);
        if (!signal.aborted) {
          setAddresses(result);
        }
      } catch {
        if (!signal.aborted) {
          setLoadError(true);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [token, attempt]);

  const beginEdit = (item?: Address) => {
    setEditor(item ? { mode: 'edit', id: item.id } : { mode: 'new' });
    setError('');
    setForm(
      item
        ? {
            city: item.city,
            street: item.street,
            house: item.house,
            apartment: item.apartment ?? '',
            entrance: item.entrance ?? '',
            floor: item.floor ?? '',
            comment: item.comment ?? '',
            latitude: item.latitude ?? undefined,
            longitude: item.longitude ?? undefined,
            isDefault: item.isDefault,
          }
        : { ...EMPTY_ADDRESS },
    );
  };
  const update = (
    key: 'city' | 'street' | 'house' | 'apartment' | 'entrance' | 'floor' | 'comment',
    value: string,
  ) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor || saving) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: AddressInput = {
        ...form,
        city: form.city.trim(),
        street: form.street.trim(),
        house: form.house.trim(),
        apartment: form.apartment?.trim() || undefined,
        entrance: form.entrance?.trim() || undefined,
        floor: form.floor?.trim() || undefined,
        comment: form.comment?.trim() || undefined,
      };
      if (!payload.city || !payload.street || !payload.house) {
        setError(t('address.required'));
        return;
      }
      const result =
        editor.mode === 'edit'
          ? await updateAddress(token, editor.id, payload)
          : await createAddress(token, payload);

      setAddresses((items) => {
        const updated = items.map((item) => {
          if (item.id === result.id) {
            return result;
          }
          return result.isDefault ? { ...item, isDefault: false } : item;
        });
        return editor.mode === 'edit' ? updated : [result, ...updated];
      });
      setEditor(null);
      setForm({ ...EMPTY_ADDRESS });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t('address.saveError'));
    } finally {
      setSaving(false);
    }
  };
  const localizedDate = (value: string) =>
    new Date(value).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US');
  return (
    <>
      <PageHeading title={t('address.title')} description={t('address.description')} />
      <div className="commerce-layout address-layout">
        <section className="address-list" aria-label={t('address.saved')}>
          {loading ? (
            <div className="panel loading-panel" role="status">
              {t('common.loading')}
            </div>
          ) : loadError ? (
            <div className="notice notice-error" role="alert">
              {t('address.loadError')}{' '}
              <button className="text-button" onClick={() => setAttempt((current) => current + 1)}>
                {t('common.retry')}
              </button>
            </div>
          ) : addresses.length ? (
            addresses.map((item) => (
              <article className="panel saved-address" key={item.id}>
                <div className="saved-address-icon">
                  <MapPin size={19} />
                </div>
                <div className="saved-address-copy">
                  <div className="saved-address-title">
                    <strong>
                      {item.city}, {item.street}, {item.house}
                    </strong>
                    {item.isDefault && <span className="default-pill">{t('address.default')}</span>}
                  </div>
                  <p>
                    {[
                      item.apartment && `${t('address.apartment')} ${item.apartment}`,
                      item.entrance && `${t('address.entrance')} ${item.entrance}`,
                      item.floor && `${t('address.floor')} ${item.floor}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <small>{t('address.updated', { date: localizedDate(item.updatedAt) })}</small>
                </div>
                <div className="address-actions">
                  <button
                    type="button"
                    className="button button-light"
                    onClick={() => beginEdit(item)}
                  >
                    <Pencil size={16} />
                    {t('address.edit')}
                  </button>
                  <button
                    type="button"
                    className="button button-dark"
                    onClick={() => {
                      saveSelectedAddressId(item.id);
                      navigate(returnTo);
                    }}
                  >
                    <Check size={16} />
                    {t('address.select')}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="catalog-state">
              <span className="state-icon">
                <MapPin />
              </span>
              <h2>{t('address.empty')}</h2>
              <p>{t('address.emptyText')}</p>
            </div>
          )}
          {editor === null && (
            <button
              type="button"
              className="button button-light address-add"
              onClick={() => beginEdit()}
            >
              <Plus size={18} />
              {t('address.add')}
            </button>
          )}
          <Link to="/checkout" className="text-link">
            {t('checkout.back')}
          </Link>
        </section>
        {editor !== null && (
          <form className="panel address-form" onSubmit={(event) => void submit(event)}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">NORI SUSHI</p>
                <h2>{editor.mode === 'edit' ? t('address.edit') : t('address.new')}</h2>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setEditor(null);
                  setError('');
                }}
              >
                {t('common.cancel')}
              </button>
            </div>
            <div className="form-grid">
              <AddressFields value={form} onChange={update} />
              <label className="form-wide">
                {t('address.comment')}
                <input
                  value={form.comment ?? ''}
                  onChange={(e) => update('comment', e.target.value)}
                />
              </label>
            </div>
            {error && (
              <p className="inline-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="button button-dark" disabled={saving}>
              {saving ? t('common.loading') : t('address.save')}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
