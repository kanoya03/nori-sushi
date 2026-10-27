import { Suspense, lazy, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, MapPin, Plus, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { createGuestOrder, createOrder, getAddresses } from '../api/commerceApi';
import { AddressFields } from '../components/checkout/AddressFields';
import { CheckoutPayment } from '../components/checkout/CheckoutPayment';
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';
import { CatalogGuard } from '../components/common/CatalogGuard';
import { PageHeading } from '../components/common/PageHeading';
import { PICKUP_POINTS } from '../constants/pickupPoints';
import { DELIVERY_FEE_KZT, MINIMUM_ORDER_KZT } from '../constants/checkout';
import { saveGuestOrderRef } from '../lib/guestOrders';
import {
  clearOrderAttemptKey,
  getOrderAttemptKey,
  hasPendingOrderAttempt,
} from '../lib/orderAttempt';
import { getProducts } from '../api/productsApi';
import { readSelectedAddressId } from '../lib/selectedAddress';
import { readGuestPhone, saveGuestPhone } from '../lib/guestPhone';
import { normalizePhoneNumber } from '../utils/phone';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useCatalogStore } from '../store/catalogStore';
import { useLanguageStore } from '../store/languageStore';
import { getCartLines, getSubtotal, cartSelection, cartCatalogChanged } from '../utils/cart';
import { formatPrice } from '../utils/formatters';
import type { Address, DeliveryType, PaymentMethod } from '../types/commerce';

type DraftAddress = {
  city: string;
  street: string;
  house: string;
  apartment: string;
  entrance: string;
  floor: string;
  latitude?: number;
  longitude?: number;
};
const EMPTY_DRAFT: DraftAddress = {
  city: 'Milano',
  street: '',
  house: '',
  apartment: '',
  entrance: '',
  floor: '',
};
const DeliveryMap = lazy(() =>
  import('../components/checkout/DeliveryMap').then((module) => ({ default: module.DeliveryMap })),
);
const MAPBOX_ENABLED = Boolean(import.meta.env.VITE_MAPBOX_TOKEN?.trim());

function formatAddress(address: DraftAddress | Address, language: 'ru' | 'en') {
  const apartment = address.apartment
    ? `${language === 'ru' ? 'кв.' : 'apt.'} ${address.apartment}`
    : '';
  const entrance = address.entrance
    ? `${language === 'ru' ? 'подъезд' : 'entrance'} ${address.entrance}`
    : '';
  const floor = address.floor ? `${language === 'ru' ? 'этаж' : 'floor'} ${address.floor}` : '';
  return [address.city, address.street, address.house, apartment, entrance, floor]
    .filter(Boolean)
    .join(', ');
}

export function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguageStore((state) => state.language);
  const token = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);
  const userPhone = useAuthStore((state) => state.user?.phone);
  const phoneScope = token ? `user:${userId}` : 'guest';
  const savedPhone = token ? (normalizePhoneNumber(userPhone) ?? '') : readGuestPhone();
  const [phoneEntry, setPhoneEntry] = useState({ scope: '', value: '' });
  const phone = phoneEntry.scope === phoneScope ? phoneEntry.value : savedPhone;
  const [phoneError, setPhoneError] = useState(false);
  const authStatus = useAuthStore((state) => state.status);
  const entries = useCartStore((state) => state.entries);
  const clear = useCartStore((state) => state.clear);
  const products = useCatalogStore((state) => state.products);
  const lines = getCartLines(entries, products);
  const subtotal = getSubtotal(lines);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD_ON_DELIVERY');
  const [comment, setComment] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftAddress>(EMPTY_DRAFT);
  const [draftMode, setDraftMode] = useState(!token);
  const [pickupId, setPickupId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressLoadError, setAddressLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submitRequest = useRef<AbortController | null>(null);
  useEffect(() => () => submitRequest.current?.abort(), []);
  const selectedAddress = addresses.find((item) => item.id === selectedAddressId) ?? null;
  const pickup = PICKUP_POINTS.find((item) => item.id === pickupId) ?? null;
  const deliveryFee = deliveryType === 'DELIVERY' ? DELIVERY_FEE_KZT : 0;
  const unavailable = lines.some((line) => !line.product);
  const minimumReached = subtotal >= MINIMUM_ORDER_KZT;
  const addressValid = draftMode
    ? !!(draft.city.trim() && draft.street.trim() && draft.house.trim())
    : !!selectedAddress;
  const sessionReady = authStatus === 'guest' || authStatus === 'authenticated';
  const canSubmit =
    sessionReady &&
    ((minimumReached && !unavailable) || hasPendingOrderAttempt(phoneScope)) &&
    (deliveryType === 'DELIVERY' ? !loadingAddresses && addressValid : !!pickup);

  useEffect(() => {
    setAddressLoadError(false);
    if (!token || authStatus !== 'authenticated') {
      setAddresses([]);
      setSelectedAddressId(null);
      setDraftMode(true);
      setLoadingAddresses(false);
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    setLoadingAddresses(true);
    setAddresses([]);
    setSelectedAddressId(null);
    getAddresses(token, signal)
      .then((list) => {
        if (signal.aborted) {
          return;
        }
        setAddresses(list);
        const stored = readSelectedAddressId();
        const preferred =
          list.find((item) => item.id === stored) ?? list.find((item) => item.isDefault) ?? list[0];
        if (preferred) {
          setSelectedAddressId(preferred.id);
          setDraftMode(false);
        } else {
          setDraftMode(true);
        }
      })
      .catch(() => {
        if (!signal.aborted) {
          setDraftMode(true);
          setAddressLoadError(true);
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoadingAddresses(false);
        }
      });
    return () => controller.abort();
  }, [token, authStatus]);

  const updateDraft = (key: Exclude<keyof DraftAddress, 'latitude' | 'longitude'>, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const mapSelect = (location: {
    latitude: number;
    longitude: number;
    address: { city: string; street: string; house: string } | null;
  }) => {
    setDraftMode(true);
    setSelectedAddressId(null);
    setDraft((current) => ({
      ...current,
      ...(location.address?.city ? { city: location.address.city } : {}),
      ...(location.address?.street ? { street: location.address.street } : {}),
      ...(location.address?.house ? { house: location.address.house } : {}),
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      submitting ||
      submitRequest.current ||
      !sessionReady ||
      (deliveryType === 'DELIVERY' && loadingAddresses)
    ) {
      return;
    }
    setError('');
    const recipientPhone = normalizePhoneNumber(phone);
    if (!recipientPhone) {
      setPhoneError(true);
      setError(t('checkout.phoneInvalid'));
      return;
    }
    if (!entries.length) {
      setError(t('checkout.cartEmpty'));
      return;
    }
    if (deliveryType === 'DELIVERY' && !addressValid) {
      setError(t('checkout.addressRequired'));
      return;
    }
    let address: string;
    if (deliveryType === 'PICKUP') {
      if (!pickup) {
        setError(t('checkout.pickupRequired'));
        return;
      }
      address = `${pickup.name}, ${pickup.address}`;
    } else {
      const deliveryAddress = draftMode ? draft : selectedAddress;
      if (!deliveryAddress) {
        setError(t('checkout.addressRequired'));
        return;
      }
      address = formatAddress(deliveryAddress, language);
    }
    const savedAddressComment =
      deliveryType === 'DELIVERY' && !draftMode ? selectedAddress?.comment?.trim() : undefined;
    const payload = {
      recipientPhone,
      deliveryType,
      paymentMethod,
      address,
      comment: comment.trim() || savedAddressComment || undefined,
      items: entries.map(({ productId, quantity }) => ({
        productId,
        quantity,
        expectedUnitPrice: products.find((product) => product.id === productId)?.price ?? 0,
      })),
    };
    const controller = new AbortController();
    submitRequest.current = controller;
    setSubmitting(true);
    let posting = false;
    try {
      // An ambiguous previous POST must reach the server with the same key,
      // even when a product has since disappeared from the catalog.
      if (!hasPendingOrderAttempt(phoneScope, payload)) {
        const fresh = await getProducts(controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        if (cartSelection(useCartStore.getState().entries) !== cartSelection(entries)) {
          setError(t('checkout.cartUpdated'));
          return;
        }
        const freshLines = getCartLines(entries, fresh);
        useCatalogStore.setState({ products: fresh });
        if (freshLines.some((line) => !line.product)) {
          setError(t('checkout.unavailable'));
          return;
        }
        if (cartCatalogChanged(lines, freshLines)) {
          setError(t('checkout.cartUpdated'));
          return;
        }
        if (getSubtotal(freshLines) < MINIMUM_ORDER_KZT) {
          setError(
            t('checkout.minimumError', { amount: formatPrice(MINIMUM_ORDER_KZT, language) }),
          );
          return;
        }
      }
      if (
        controller.signal.aborted ||
        useAuthStore.getState().accessToken !== token ||
        cartSelection(useCartStore.getState().entries) !== cartSelection(entries)
      ) {
        return;
      }
      const idempotencyKey = getOrderAttemptKey(phoneScope, payload);
      const orderInput = { ...payload, idempotencyKey };
      posting = true;
      const order = token
        ? await createOrder(token, orderInput, controller.signal)
        : await createGuestOrder(orderInput, controller.signal);
      if (controller.signal.aborted) {
        return;
      }
      let guestOrderPersisted = true;
      if (!token) {
        if (!order.guestToken) {
          throw new Error('Guest order token was not returned by the API');
        }
        guestOrderPersisted = saveGuestOrderRef({
          orderId: order.id,
          guestToken: order.guestToken,
        });
      }
      if (!token) {
        saveGuestPhone(recipientPhone);
      } else {
        const current = useAuthStore.getState();
        if (current.user && current.user.id === userId && current.accessToken === token) {
          useAuthStore.setState({ user: { ...current.user, phone: recipientPhone } });
        }
      }
      clear();
      clearOrderAttemptKey(idempotencyKey);
      navigate(token ? `/orders/${order.id}` : `/guest-orders/${order.id}`, {
        replace: true,
        state: { justCreated: true, guestOrderPersisted },
      });
    } catch (cause) {
      if (controller.signal.aborted) {
        return;
      }
      if (cause instanceof ApiError && cause.status === 409 && cause.code === 'CART_CHANGED') {
        try {
          const fresh = await getProducts(controller.signal);
          if (!controller.signal.aborted) {
            useCatalogStore.setState({ products: fresh });
            setError(
              t(
                getCartLines(entries, fresh).some((line) => !line.product)
                  ? 'checkout.unavailable'
                  : 'checkout.cartUpdated',
              ),
            );
          }
        } catch {
          if (!controller.signal.aborted) {
            setError(t('checkout.catalogRefreshError'));
          }
        }
        return;
      }
      setError(
        !posting
          ? t('checkout.catalogRefreshError')
          : cause instanceof ApiError && cause.status === 429
            ? t('checkout.rateLimited')
            : cause instanceof ApiError && cause.status === 400
              ? t('checkout.serverValidation')
              : t('checkout.orderError'),
      );
    } finally {
      if (submitRequest.current === controller) {
        submitRequest.current = null;
      }
      if (!controller.signal.aborted) {
        setSubmitting(false);
      }
    }
  };

  if (!entries.length) {
    return (
      <>
        <PageHeading title={t('checkout.title')} description={t('checkout.description')} />
        <div className="catalog-state">
          <h2>{t('checkout.cartEmpty')}</h2>
          <Link className="button button-dark" to="/menu">
            {t('common.menu')}
            <ArrowRight size={17} />
          </Link>
        </div>
      </>
    );
  }

  return (
    <CatalogGuard>
      <PageHeading title={t('checkout.title')} description={t('checkout.description')} />
      <form
        className="commerce-layout checkout-layout"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div className="checkout-main" inert={submitting}>
          <section className="panel checkout-section">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">01 / {t('checkout.receive')}</p>
                <h2>{t('checkout.receiveTitle')}</h2>
              </div>
            </div>
            <div className="choice-row">
              <button
                type="button"
                aria-pressed={deliveryType === 'DELIVERY'}
                className={`choice-card ${deliveryType === 'DELIVERY' ? 'is-selected' : ''}`}
                onClick={() => setDeliveryType('DELIVERY')}
              >
                <MapPin />
                <span>
                  <strong>{t('checkout.delivery')}</strong>
                  <small>{t('checkout.deliveryHint')}</small>
                </span>
                {deliveryType === 'DELIVERY' && <Check className="choice-check" />}
              </button>
              <button
                type="button"
                aria-pressed={deliveryType === 'PICKUP'}
                className={`choice-card ${deliveryType === 'PICKUP' ? 'is-selected' : ''}`}
                onClick={() => setDeliveryType('PICKUP')}
              >
                <Store />
                <span>
                  <strong>{t('checkout.pickup')}</strong>
                  <small>{t('checkout.pickupHint')}</small>
                </span>
                {deliveryType === 'PICKUP' && <Check className="choice-check" />}
              </button>
            </div>
            {deliveryType === 'DELIVERY' ? (
              <div className="delivery-address-block">
                <div className="panel-heading address-heading">
                  <div>
                    <h3>{t('checkout.addressTitle')}</h3>
                    <p className="muted">
                      {token ? t('checkout.addressAccountHint') : t('checkout.guestAddressHint')}
                    </p>
                  </div>
                  {token && (
                    <Link className="text-link" to="/addresses" state={{ returnTo: '/checkout' }}>
                      {t('address.manage')}
                    </Link>
                  )}
                </div>
                {loadingAddresses ? (
                  <div className="loading-panel" role="status">
                    {t('common.loading')}
                  </div>
                ) : (
                  <>
                    {!!addresses.length && (
                      <div
                        className="saved-address-options"
                        role="radiogroup"
                        aria-label={t('address.saved')}
                      >
                        {addresses.map((item) => (
                          <button
                            type="button"
                            role="radio"
                            aria-checked={!draftMode && selectedAddressId === item.id}
                            className={`saved-address-option ${!draftMode && selectedAddressId === item.id ? 'is-selected' : ''}`}
                            key={item.id}
                            onClick={() => {
                              setSelectedAddressId(item.id);
                              setDraftMode(false);
                            }}
                          >
                            <MapPin size={17} />
                            <span>
                              <strong>
                                {item.city}, {item.street}, {item.house}
                              </strong>
                              <small>
                                {[
                                  item.apartment && `${t('address.apartment')} ${item.apartment}`,
                                  item.entrance && `${t('address.entrance')} ${item.entrance}`,
                                  item.floor && `${t('address.floor')} ${item.floor}`,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </small>
                            </span>
                            {item.isDefault && <em>{t('address.default')}</em>}
                          </button>
                        ))}
                      </div>
                    )}
                    {token && (
                      <button
                        type="button"
                        className={`saved-address-option new-address-option ${draftMode ? 'is-selected' : ''}`}
                        onClick={() => {
                          setDraftMode(true);
                          setSelectedAddressId(null);
                        }}
                      >
                        <Plus size={18} aria-hidden="true" />
                        {t('address.useNew')}
                      </button>
                    )}
                    {draftMode && (
                      <>
                        <div className="form-grid checkout-address-fields">
                          <AddressFields value={draft} onChange={updateDraft} />
                        </div>
                        {MAPBOX_ENABLED ? (
                          <Suspense
                            fallback={
                              <div className="map-placeholder">{t('checkout.mapUnavailable')}</div>
                            }
                          >
                            <DeliveryMap language={language} onSelect={mapSelect} />
                          </Suspense>
                        ) : (
                          <div className="map-placeholder">
                            <strong>{t('checkout.mapUnavailable')}</strong>
                            <p>{t('checkout.mapFallback')}</p>
                          </div>
                        )}
                      </>
                    )}
                    {!token && (
                      <p className="muted guest-address-note">{t('checkout.guestNoAccount')}</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div
                className="pickup-choice-list"
                role="radiogroup"
                aria-label={t('checkout.pickupLocations')}
              >
                {PICKUP_POINTS.map((point) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={pickupId === point.id}
                    className={`pickup-option ${pickupId === point.id ? 'is-selected' : ''}`}
                    key={point.id}
                    onClick={() => setPickupId(point.id)}
                  >
                    <span className="pickup-marker">
                      <Store size={17} />
                    </span>
                    <span>
                      <strong>{point.name}</strong>
                      <small>{point.address}</small>
                    </span>
                    {pickupId === point.id && <Check className="choice-check" />}
                  </button>
                ))}
              </div>
            )}
          </section>
          <section className="panel checkout-section">
            <h2>{t('checkout.contactTitle')}</h2>
            <label className="comment-field" htmlFor="recipient-phone">
              {t('checkout.phone')}
              <input
                id="recipient-phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                maxLength={32}
                placeholder="+7 (701) 123-45-67"
                required
                value={phone}
                aria-invalid={phoneError}
                aria-describedby="recipient-phone-hint"
                onChange={(event) => {
                  setPhoneEntry({ scope: phoneScope, value: event.target.value });
                  setPhoneError(false);
                }}
                onBlur={() => setPhoneError(Boolean(phone) && !normalizePhoneNumber(phone))}
              />
            </label>
            <p id="recipient-phone-hint" className={phoneError ? 'inline-error' : 'muted'}>
              {t(phoneError ? 'checkout.phoneInvalid' : 'checkout.phoneHint')}
            </p>
          </section>
          <CheckoutPayment
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            comment={comment}
            onCommentChange={setComment}
          />
        </div>
        <CheckoutSummary
          lines={lines}
          deliveryFee={deliveryFee}
          submitting={submitting}
          submitDisabled={!canSubmit || submitting}
          error={error || (addressLoadError ? t('checkout.addressLoadError') : '')}
        />
      </form>
    </CatalogGuard>
  );
}
