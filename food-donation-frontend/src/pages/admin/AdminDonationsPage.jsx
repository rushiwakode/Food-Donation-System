import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ClipboardDocumentListIcon, CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import adminService from '../../services/adminService';
import { DONATION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const TABS = ['ALL', ...Object.values(DONATION_STATUS)];

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0 });
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getAllDonations({
        status: activeTab === 'ALL' ? undefined : activeTab,
        page, size: 10,
      });
      setDonations(result.content);
      setPageData(result);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  const handleApprove = async (id) => {
    try {
      await adminService.approveDonation(id);
      toast.success('Donation approved');
      fetchDonations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason'); return; }
    try {
      await adminService.rejectDonation(rejectingId, rejectReason);
      toast.success('Donation rejected');
      setRejectingId(null);
      setRejectReason('');
      fetchDonations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mb-6">Donation Management</h1>

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
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}</div>
      ) : donations.length === 0 ? (
        <EmptyState icon={ClipboardDocumentListIcon} title="No donations found" description="Donations matching this filter will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-forest-50 dark:bg-forest-800/50 text-forest-600 dark:text-cream-300 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Donation</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Donor</th>
                <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">City</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Created</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-900/8 dark:divide-cream-100/8">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-forest-50/50 dark:hover:bg-forest-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-forest-900 dark:text-cream-50 max-w-[180px] truncate">{d.title}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-forest-600 dark:text-cream-300">{d.donorName}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-forest-600 dark:text-cream-300">{d.pickupCity}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-forest-500 dark:text-cream-400">{formatDate(d.createdAt)}</td>
                  <td className="px-5 py-3.5"><Badge status={d.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/browse/${d.id}`} target="_blank" rel="noreferrer" className="btn-icon !w-8 !h-8" title="View"><EyeIcon className="w-4 h-4" /></a>
                      {d.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(d.id)} className="btn-icon !w-8 !h-8 text-forest-600" title="Approve"><CheckIcon className="w-4 h-4" /></button>
                          <button onClick={() => setRejectingId(d.id)} className="btn-icon !w-8 !h-8 text-tomato-600" title="Reject"><XMarkIcon className="w-4 h-4" /></button>
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

      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/50 backdrop-blur-sm" onClick={() => setRejectingId(null)}>
          <div className="glass-card bg-white dark:bg-forest-900 p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-semibold mb-3">Reject Donation</h3>
            <label className="label-field">Reason for rejection</label>
            <textarea className="input-field" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete pickup details, expired listing…" />
            <div className="flex gap-3 justify-end mt-4">
              <button className="btn-secondary" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
              <button className="btn-danger" onClick={handleReject}>Reject Donation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
