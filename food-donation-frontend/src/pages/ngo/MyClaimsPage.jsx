import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { HeartIcon, MapPinIcon, TruckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ngoService from '../../services/ngoService';
import { formatDateTime } from '../../utils/formatters';

const TABS = ['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

export default function MyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0 });
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [toCancel, setToCancel] = useState(null);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const result = await ngoService.getMyClaims({
        status: activeTab === 'ALL' ? undefined : activeTab,
        page, size: 8,
      });
      setClaims(result.content);
      setPageData(result);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const handleCancel = async () => {
    try {
      await ngoService.cancelClaim(toCancel);
      toast.success('Claim cancelled');
      setToCancel(null);
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel claim');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mb-6">My Claims</h1>

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
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 w-full" />)}</div>
      ) : claims.length === 0 ? (
        <EmptyState icon={HeartIcon} title="No claims here" description="Claims you make on available donations will show up here." />
      ) : (
        <div className="space-y-4">
          {claims.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50">{c.donationTitle}</h3>
                  <p className="text-sm text-forest-500 dark:text-cream-300 flex items-center gap-1 mt-1">
                    <MapPinIcon className="w-3.5 h-3.5" /> {c.donationCity}
                  </p>
                </div>
                <Badge status={c.status} />
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-forest-900/8 dark:border-cream-100/8 text-sm">
                <div>
                  <p className="text-xs text-forest-500 dark:text-cream-400">Claimed</p>
                  <p className="font-medium text-forest-800 dark:text-cream-100">{formatDateTime(c.claimedAt)}</p>
                </div>
                {c.peopleCount && (
                  <div>
                    <p className="text-xs text-forest-500 dark:text-cream-400">Beneficiaries</p>
                    <p className="font-medium text-forest-800 dark:text-cream-100">{c.peopleCount} people</p>
                  </div>
                )}
                {c.delivery && (
                  <div>
                    <p className="text-xs text-forest-500 dark:text-cream-400 flex items-center gap-1"><TruckIcon className="w-3.5 h-3.5" /> Delivery Agent</p>
                    <p className="font-medium text-forest-800 dark:text-cream-100">{c.delivery.agentName || 'Not yet assigned'}</p>
                  </div>
                )}
              </div>

              {(c.status === 'PENDING' || c.status === 'APPROVED') && (
                <div className="flex justify-end mt-4">
                  <button onClick={() => setToCancel(c.id)} className="text-sm font-medium text-tomato-600 hover:text-tomato-700 flex items-center gap-1">
                    <XMarkIcon className="w-4 h-4" /> Cancel Claim
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination pageNumber={page} totalPages={pageData.totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!toCancel}
        title="Cancel this claim?"
        message="The donation will become available for other NGOs to claim again."
        confirmLabel="Cancel Claim"
        danger
        onConfirm={handleCancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
}
