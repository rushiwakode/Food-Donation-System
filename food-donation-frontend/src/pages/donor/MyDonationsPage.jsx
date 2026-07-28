import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FreshnessRing from '../../components/common/FreshnessRing';
import donationService from '../../services/donationService';
import { DONATION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const TABS = ['ALL', ...Object.values(DONATION_STATUS)];

export default function MyDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0 });
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await donationService.getMyDonations({
        status: activeTab === 'ALL' ? undefined : activeTab,
        page, size: 8,
      });
      setDonations(result.content);
      setPageData(result);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  const handleDelete = async () => {
    try {
      await donationService.deleteDonation(toDelete);
      toast.success('Donation deleted');
      setToDelete(null);
      fetchDonations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete donation');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">My Donations</h1>
        <Link to="/donor/donations/new" className="btn-primary">
          <PlusIcon className="w-4 h-4" /> Add Donation
        </Link>
      </div>

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
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : donations.length === 0 ? (
        <EmptyState
          icon={ClipboardDocumentListIcon}
          title="No donations here"
          description="Donations matching this filter will appear here once created."
          action={<Link to="/donor/donations/new" className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Donation</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-forest-50 dark:bg-forest-800/50 text-forest-600 dark:text-cream-300 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Donation</th>
                <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Quantity</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Created</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Freshness</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-900/8 dark:divide-cream-100/8">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-forest-50/50 dark:hover:bg-forest-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-forest-900 dark:text-cream-50 max-w-[200px] truncate">{d.title}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-forest-600 dark:text-cream-300">{d.quantity} {d.quantityUnit?.toLowerCase()}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-forest-500 dark:text-cream-400">{formatDate(d.createdAt)}</td>
                  <td className="px-5 py-3.5"><Badge status={d.status} /></td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    {['EXPIRED', 'DELIVERED', 'CANCELLED', 'REJECTED'].includes(d.status) ? '—' : <FreshnessRing expiresAt={d.expiresAt} size={32} strokeWidth={3} />}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/browse/${d.id}`)} className="btn-icon !w-8 !h-8" title="View"><EyeIcon className="w-4 h-4" /></button>
                      {d.status === 'PENDING' && (
                        <>
                          <button onClick={() => navigate(`/donor/donations/${d.id}/edit`)} className="btn-icon !w-8 !h-8" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                          <button onClick={() => setToDelete(d.id)} className="btn-icon !w-8 !h-8 text-tomato-600" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pageNumber={page} totalPages={pageData.totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this donation?"
        message="This action cannot be undone. The donation listing will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
