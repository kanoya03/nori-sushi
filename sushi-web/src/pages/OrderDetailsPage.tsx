import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { cancelGuestOrder, cancelOrder, getGuestOrder, getOrder } from '../api/commerceApi';
import { readGuestOrderRefs } from '../lib/guestOrders';
import { PageHeading } from '../components/common/PageHeading';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useCatalogStore } from '../store/catalogStore';
import { useLanguageStore } from '../store/languageStore';
import type { Order } from '../types/commerce';
import { formatPrice } from '../utils/formatters';

export function OrderDetailsPage({ guest = false }: { guest?: boolean }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const token = useAuthStore((state) => state.accessToken);
  const authStatus = useAuthStore((state) => state.status);

  if (!guest && (authStatus === 'idle' || authStatus === 'restoring')) {
    return (
      <div className="panel loading-panel" role="status">
        {t('auth.restoring')}
      </div>
    );
  }

  return (
    <OrderDetails key={`${guest}:${id}:${token}`} id={Number(id)} token={token} guest={guest} />
  );
}

type Props = { id: number; token: string | null; guest: boolean };

function OrderDetails({ id, token, guest }: Props) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = Boolean(location.state?.justCreated);
  const guestOrderStorageError = guest && location.state?.guestOrderPersisted === false;
  const add = useCartStore((state) => state.add);
  const products = useCatalogStore((state) => state.products);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [repeatMessage, setRepeatMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setLoading(true);
    setOrder(null);
    setRepeatMessage('');
    setError('');
    const load = async () => {
      try {
        if (!Number.isSafeInteger(id) || id <= 0) {
          throw new Error('invalid-id');
        }
        let result: Order;
        if (guest) {
          const ref = readGuestOrderRefs().find((item) => item.orderId === id);
          if (!ref) {
            throw new Error('guest-reference');
          }
          result = await getGuestOrder(id, ref.guestToken, signal);
        } else {
          if (!token) {
            throw new Error('auth-required');
          }
          result = await getOrder(token, id, signal);
        }
        if (!signal.aborted) {
          setOrder(result);
        }
      } catch (cause) {
        if (!signal.aborted) {
          setError(
            cause instanceof ApiError
              ? t('orders.detailError')
              : t(guest ? 'orders.guestAccessLost' : 'orders.detailError'),
          );
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [id, token, guest, t]);

  const cancel = async () => {
    if (!order || busy || !window.confirm(t('orders.cancelConfirm'))) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      let updated: Order;
      if (guest) {
        const ref = readGuestOrderRefs().find((item) => item.orderId === order.id);
        if (!ref) {
          throw new Error();
        }
        updated = await cancelGuestOrder(order.id, ref.guestToken);
      } else {
        if (!token) {
          throw new Error();
        }
        updated = await cancelOrder(token, order.id);
      }
      setOrder(updated);
    } catch {
      setError(t('orders.cancelError'));
    } finally {
      setBusy(false);
    }
  };
  const repeat = () => {
    if (!order) {
      return;
    }
    let addedCount = 0;
    for (const item of order.items) {
      const product = products.find((entry) => entry.id === item.productId);
      if (product) {
        add(product.id, item.quantity);
        addedCount += 1;
      }
    }
    if (!addedCount) {
      setRepeatMessage(t('orders.repeatUnavailable'));
      return;
    }
    navigate('/cart');
  };
  const canCancel = order?.status === 'PENDING' || order?.status === 'CONFIRMED';
  const date = order
    ? new Date(order.createdAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')
    : '';
  if (loading) {
    return (
      <>
        <PageHeading title={t('orders.detailsTitle')} description={t('orders.loading')} />
        <div className="panel loading-panel" role="status">
          {t('orders.loading')}
        </div>
      </>
    );
  }
  if (!order) {
    return (
      <>
        <PageHeading title={t('orders.detailsTitle')} description="" />
        <div className="panel state-panel" role="alert">
          <XCircle />
          <h2>{error || t('orders.detailError')}</h2>
          <Link to="/orders" className="button button-light">
            <ArrowLeft size={16} />
            {t('orders.back')}
          </Link>
        </div>
      </>
    );
  }
  return (
    <>
      {guestOrderStorageError && (
        <div className="notice" role="alert">
          {t('common.storageError')}
        </div>
      )}
      {justCreated && (
        <div className="notice notice-success order-success" role="status">
          <CheckCircle2 size={18} />
          {t('orders.success')}
        </div>
      )}
      <PageHeading title={t('orders.orderNumber', { id: order.id })} description={date} />
      <div className="order-detail-layout">
        <section className="panel order-detail-card">
          <div className="order-status-header">
            <span className={`status-pill status-${order.status.toLowerCase()}`}>
              {t(`orders.status.${order.status}`)}
            </span>
            <span>
              {order.deliveryType === 'DELIVERY' ? t('checkout.delivery') : t('checkout.pickup')}
            </span>
          </div>
          <h2>{t('orders.itemsTitle')}</h2>
          <div className="order-detail-items">
            {order.items.map((item) => (
              <div className="order-detail-item" key={item.id}>
                <div>
                  <strong>
                    {item.product?.nameEn && language === 'en'
                      ? item.product.nameEn
                      : item.product?.name || item.productName}
                  </strong>
                  <small>
                    {item.quantity} × {formatPrice(item.unitPrice, language)}
                  </small>
                </div>
                <strong>{formatPrice(item.quantity * item.unitPrice, language)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-totals order-detail-totals">
            <div>
              <span>{t('cart.subtotal')}</span>
              <strong>{formatPrice(order.subtotal, language)}</strong>
            </div>
            <div>
              <span>{t('checkout.deliveryFee')}</span>
              <strong>
                {order.deliveryFee ? formatPrice(order.deliveryFee, language) : t('checkout.free')}
              </strong>
            </div>
            <div className="summary-total">
              <span>{t('checkout.total')}</span>
              <strong>{formatPrice(order.totalPrice, language)}</strong>
            </div>
          </div>
        </section>
        <aside className="panel order-info-card">
          <p className="eyebrow">NORI SUSHI</p>
          <h2>{t('orders.deliveryInfo')}</h2>
          <dl>
            <div>
              <dt>{t('orders.type')}</dt>
              <dd>
                {order.deliveryType === 'DELIVERY' ? t('checkout.delivery') : t('checkout.pickup')}
              </dd>
            </div>
            <div>
              <dt>{t('orders.address')}</dt>
              <dd>{order.address || '—'}</dd>
            </div>
            <div>
              <dt>{t('orders.payment')}</dt>
              <dd>
                {t(order.paymentMethod === 'CASH' ? 'checkout.cash' : 'checkout.cardOnDelivery')}
              </dd>
            </div>
            {order.comment && (
              <div>
                <dt>{t('checkout.comment')}</dt>
                <dd>{order.comment}</dd>
              </div>
            )}
          </dl>
          <div className="order-detail-actions">
            {canCancel && (
              <button
                type="button"
                className="button button-light danger-button"
                onClick={() => void cancel()}
                disabled={busy}
              >
                <XCircle size={16} />
                {busy ? t('common.loading') : t('orders.cancel')}
              </button>
            )}
            <button type="button" className="button button-dark" onClick={repeat}>
              <RotateCcw size={16} />
              {t('orders.repeat')}
            </button>
          </div>
          {repeatMessage && (
            <p className="inline-error" role="status">
              {repeatMessage}
            </p>
          )}
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
        </aside>
      </div>
      <Link to="/orders" className="text-link order-back-link">
        <ArrowLeft size={16} />
        {t('orders.back')}
      </Link>
      <div className="order-support-note">
        <CheckCircle2 size={16} />
        {t('orders.serverNote')}
      </div>
    </>
  );
}
