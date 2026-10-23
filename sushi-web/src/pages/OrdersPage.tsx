import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '../components/common/PageHeading';
import { useOrders } from '../hooks/useOrders';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { formatPrice } from '../utils/formatters';

export function OrdersPage() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.accessToken);
  const language = useLanguageStore((state) => state.language);
  const { orders, loading, error, reload } = useOrders();

  const title = t('orders.title');
  return (
    <>
      <PageHeading title={title} description={t('orders.description')} />
      {loading ? (
        <div className="panel loading-panel" role="status">
          {t('orders.loading')}
        </div>
      ) : error ? (
        <div className="panel state-panel" role="alert">
          <h2>{t('orders.loadError')}</h2>
          <button type="button" className="button button-light" onClick={reload}>
            {t('common.retry')}
          </button>
        </div>
      ) : !orders.length ? (
        <div className="catalog-state">
          <span className="state-icon">
            <ClipboardList size={30} />
          </span>
          <h2>{t('orders.empty')}</h2>
          <p>{t(token ? 'orders.emptyText' : 'orders.guestEmptyText')}</p>
          <Link className="button button-dark" to="/menu">
            {t('common.menu')}
            <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link
              className="panel order-row"
              to={token ? `/orders/${order.id}` : `/guest-orders/${order.id}`}
              key={order.id}
            >
              <span className="order-row-icon">
                <ClipboardList />
              </span>
              <span className="order-row-main">
                <span className="order-row-title">
                  <strong>{t('orders.orderNumber', { id: order.id })}</strong>
                  <span className={`status-pill status-${order.status.toLowerCase()}`}>
                    {t(`orders.status.${order.status}`)}
                  </span>
                </span>
                <small>
                  {new Date(order.createdAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                </small>
                <small>
                  {order.deliveryType === 'DELIVERY'
                    ? t('checkout.delivery')
                    : t('checkout.pickup')}{' '}
                  · {order.items.length} {t('orders.items')}
                </small>
              </span>
              <strong className="order-row-total">{formatPrice(order.totalPrice, language)}</strong>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
