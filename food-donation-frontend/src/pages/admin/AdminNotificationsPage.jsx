import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon, CheckIcon, TrashIcon, FunnelIcon,
  InformationCircleIcon, ExclamationTriangleIcon,
  TruckIcon, HeartIcon, GiftIcon,
} from '@heroicons/react/24/outline';
import notificationService from '../../services/notificationService';
import { formatRelativeTime } from '../../utils/formatters';

const TYPE_META = {
  DONATION: { icon: GiftIcon,     color: 'text-primary-500',  bg: 'bg-primary-50 dark:bg-primary-900/20',  label: 'Donation' },
  CLAIM:    { icon: HeartIcon,    color: 'text-accent-500',   bg: 'bg-accent-50 dark:bg-accent-900/20',    label: 'Claim'    },
  DELIVERY: { icon: TruckIcon,    color: 'text-emerald-500',  bg: 'bg-emerald-50 dark:bg-emerald-900/20',  label: 'Delivery' },
  ALERT:    { icon: ExclamationTriangleIcon, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Alert' },
  SYSTEM:   { icon: InformationCircleIcon,  color: 'text-slate-500',  bg: 'bg-slate-50 dark:bg-slate-800',  label: 'System' },
  INFO:     { icon: InformationCircleIcon,  color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Info'   },
};

const FILTER_TABS = ['ALL', 'UNREAD', 'DONATION', 'CLAIM', 'DELIVERY', 'ALERT', 'SYSTEM'];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [activeFilter, setActiveFilter]   = useState('ALL');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationService.getMyNotifications({ page, size: 15 });
      setNotifications(result.content || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'ALL')    return true;
    if (activeFilter === 'UNREAD') return !n.isRead;
    return n.type === activeFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm">
              <BellIcon className="w-5 h-5 text-white" />
            </span>
            Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 ml-13">
            {totalElements > 0 ? `${totalElements} total` : 'No notifications yet'} 
            {unreadCount > 0 && <span className="ml-2 badge badge-info">{unreadCount} unread</span>}
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-outline !py-2 text-sm">
            <CheckIcon className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeFilter === tab
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 flex gap-4">
              <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
            <BellIcon className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {activeFilter === 'UNREAD' ? 'All caught up!' : 'No notifications'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {activeFilter === 'UNREAD'
              ? 'You have no unread notifications.'
              : 'Notifications will appear here.'}
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {filtered.map((n, i) => {
              const meta = TYPE_META[n.type] || TYPE_META.INFO;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`card p-4 flex items-start gap-4 cursor-pointer group transition-all duration-200
                    ${!n.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30 dark:bg-primary-900/10' : ''}
                  `}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-slow" />
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`badge ${
                        n.type === 'DONATION' ? 'badge-info' :
                        n.type === 'CLAIM'    ? 'badge-purple' :
                        n.type === 'DELIVERY' ? 'badge-success' :
                        n.type === 'ALERT'    ? 'badge-warning' : 'badge-neutral'
                      }`}>
                        {meta.label}
                      </span>
                      {!n.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400 px-3">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
