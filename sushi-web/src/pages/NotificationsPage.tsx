import {
  Bell,
  CheckCircle2,
  Clock3,
  Gift,
  PackageCheck,
  Truck,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrders } from '../hooks/useOrders';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import type { OrderStatus } from '../types/commerce';
import { PageHeading } from '../components/common/PageHeading';

const statusIcons: Record<OrderStatus, typeof Clock3> = {
  PENDING: Clock3,
  CONFIRMED: CheckCircle2,
  PREPARING: PackageCheck,
  DELIVERING: Truck,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
};

export function NotificationsPage() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.accessToken);
  const language = useLanguageStore((state) => state.language);
  const { orders, loading, error, reload } = useOrders();
  const recentOrders = [...orders]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 8);

  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  return (
    <>
      <PageHeading title={t('notifications.title')} description={t('notifications.description')} />
      <Link to="/promotions" className="panel offer-notification">
        <span className="notification-icon notification-icon-green">
          <Gift size={20} aria-hidden="true" />
        </span>
        <span className="notification-copy">
          <strong>{t('notifications.specialOffers')}</strong>
          <span>{t('notifications.specialOffersText')}</span>
          <small>{t('notifications.demoTag')}</small>
        </span>
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
      <section className="notification-orders" aria-labelledby="notification-orders-title">
        <div className="portfolio-section-heading">
          <div>
            <p className="eyebrow">NORI SUSHI</p>
            <h2 id="notification-orders-title">{t('notifications.orders')}</h2>
          </div>
          <Link to="/orders" className="text-link">
            {t('notifications.viewOrders')}
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        {loading ? (
          <div className="panel notifications-state" role="status">
            <span className="loading-dot" />
            {t('notifications.loading')}
          </div>
        ) : error ? (
          <div className="panel notifications-state notification-error" role="alert">
            <Bell size={23} />
            <span>{t('notifications.loadError')}</span>
            <button type="button" className="text-button" onClick={reload}>
              {t('common.retry')}
            </button>
          </div>
        ) : orders.length ? (
          <div className="panel notification-list">
            {recentOrders.map((order) => {
              const Icon = statusIcons[order.status];
              return (
                <Link
                  className="notification-order"
                  to={token ? `/orders/${order.id}` : `/guest-orders/${order.id}`}
                  key={order.id}
                >
                  <span className={`notification-icon status-icon-${order.status.toLowerCase()}`}>
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <span className="notification-copy">
                    <strong>{t('notifications.orderNumber', { id: order.id })}</strong>
                    <span>{t(`notifications.status.${order.status}`)}</span>
                    <small>
                      {new Date(order.updatedAt).toLocaleString(locale, {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </small>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="panel notifications-state notification-empty">
            <span className="notification-empty-icon">
              <Bell size={24} aria-hidden="true" />
            </span>
            <h3>{t('notifications.emptyTitle')}</h3>
            <p>{t('notifications.emptyText')}</p>
            <Link to="/menu" className="text-link">
              {t('common.menu')}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
      <p className="demo-caption" role="note">
        {t('notifications.demoNote')}
      </p>
    </>
  );
}
