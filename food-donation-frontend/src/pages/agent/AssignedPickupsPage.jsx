import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TruckIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import deliveryService from '../../services/deliveryService';
import { formatDateTime } from '../../utils/formatters';

const TABS = ['ALL', 'ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'];

export default function AssignedPickupsPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0 });
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const result = await deliveryService.getMyDeliveries({
        status: activeTab === 'ALL' ? undefined : activeTab,
        page, size: 10,
      });
      setDeliveries(result.content);
      setPageData(result);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mb-6">Assigned Pickups</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-forest-700 text-cream-50'
                : 'bg-white dark:bg-forest-900 text-forest-600 dark:text-cream-300 hover:bg-forest-50 dark:hover:bg-forest-800 border border-forest-900/8 dark:border-cream-100/8'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 w-full" />)}</div>
      ) : deliveries.length === 0 ? (
        <EmptyState icon={TruckIcon} title="No deliveries here" description="Deliveries matching this filter will appear here." />
      ) : (
        <div className="space-y-3">
          {deliveries.map((d) => (
            <Link key={d.id} to={`/agent/deliveries/${d.id}`} className="card p-5 flex items-center justify-between block hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50">{d.donationTitle}</h3>
                <p className="text-sm text-forest-500 dark:text-cream-300 flex items-center gap-1 mt-1">
                  <MapPinIcon className="w-3.5 h-3.5" /> {d.pickupAddress}, {d.pickupCity}
                </p>
                <p className="text-xs text-forest-400 dark:text-cream-400 mt-1">Assigned {formatDateTime(d.assignedAt)}</p>
              </div>
              <Badge status={d.status} />
            </Link>
          ))}
        </div>
      )}

      <Pagination pageNumber={page} totalPages={pageData.totalPages} onPageChange={setPage} />
    </div>
  );
}
