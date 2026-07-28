import { useState, useEffect, useCallback } from 'react';
import { ChartBarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import deliveryService from '../../services/deliveryService';
import { formatDateTime } from '../../utils/formatters';

export default function DeliveryHistoryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await deliveryService.getMyDeliveries({ status: 'DELIVERED', page, size: 10 });
      setDeliveries(result.content);
      setPageData(result);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mb-6">Delivery History</h1>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : deliveries.length === 0 ? (
        <EmptyState icon={ChartBarIcon} title="No completed deliveries yet" description="Your delivery history will build up here as you complete pickups." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-forest-50 dark:bg-forest-800/50 text-forest-600 dark:text-cream-300 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Donation</th>
                <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Location</th>
                <th className="text-left px-5 py-3 font-semibold">Delivered</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-900/8 dark:divide-cream-100/8">
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-forest-50/50 dark:hover:bg-forest-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-forest-900 dark:text-cream-50">{d.donationTitle}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-forest-600 dark:text-cream-300">
                    <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" /> {d.pickupCity}</span>
                  </td>
                  <td className="px-5 py-3.5 text-forest-500 dark:text-cream-400">{formatDateTime(d.deliveredAt)}</td>
                  <td className="px-5 py-3.5"><Badge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pageNumber={page} totalPages={pageData.totalPages} onPageChange={setPage} />
    </div>
  );
}
