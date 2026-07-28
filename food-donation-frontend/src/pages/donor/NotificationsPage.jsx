import { useState, useEffect, useCallback } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import notificationService from '../../services/notificationService';
import { formatRelativeTime } from '../../utils/formatters';

const TYPE_ICONS = {
  DONATION: '🍲', CLAIM: '🤝', DELIVERY: '🚚', SYSTEM: '⚙️', ALERT: '⚠️', INFO: 'ℹ️',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationService.getMyNotifications({ page, size: 15 });
      setNotifications(result.content);
      setPageData(result);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">Notifications</h1>
        <button onClick={handleMarkAllRead} className="text-sm font-medium text-forest-600 dark:text-forest-400 hover:underline">
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={BellIcon} title="You're all caught up" description="New notifications about your donations, claims, and deliveries will appear here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`card p-4 flex items-start gap-3 cursor-pointer ${!n.isRead ? 'border-l-4 border-l-forest-500' : ''}`}
            >
              <span className="text-xl shrink-0">{TYPE_ICONS[n.type] || 'ℹ️'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-forest-900 dark:text-cream-50 text-sm">{n.title}</p>
                <p className="text-sm text-forest-500 dark:text-cream-300 mt-0.5">{n.message}</p>
                <p className="text-xs text-forest-400 dark:text-cream-400 mt-1.5">{formatRelativeTime(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-tomato-500 shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}

      <Pagination pageNumber={page} totalPages={pageData.totalPages} onPageChange={setPage} />
    </div>
  );
}
