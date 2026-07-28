import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { HeartIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import adminService from '../../services/adminService';
import { formatDateTime } from '../../utils/formatters';

const TABS = ['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0 });
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getAllClaims({
        status: activeTab === 'ALL' ? undefined : activeTab,
        page, size: 10,
      });
      setClaims(result.content);
      setPageData(result);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const handleApprove = async (id) => {
    try {
      await adminService.approveClaim(id);
      toast.success('Claim approved — delivery assignment created');
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason'); return; }
    try {
      await adminService.rejectClaim(rejectingId, rejectReason);
      toast.success('Claim rejected');
      setRejectingId(null);
      setRejectReason('');
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mb-6">Claim Management</h1>

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
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : claims.length === 0 ? (
        <EmptyState icon={HeartIcon} title="No claims found" description="Claims matching this filter will appear here." />
      ) : (
        <div className="space-y-3">
          {claims.map((c) => (
            <div key={c.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50">{c.donationTitle}</h3>
                <p className="text-sm text-forest-500 dark:text-cream-300 mt-1">Claimed by <strong>{c.ngoName}</strong> · {c.donationCity}</p>
                <p className="text-xs text-forest-400 dark:text-cream-400 mt-1">{formatDateTime(c.claimedAt)}</p>
                {c.claimMessage && <p className="text-sm text-forest-600 dark:text-cream-300 mt-2 italic">"{c.claimMessage}"</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge status={c.status} />
                {c.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleApprove(c.id)} className="btn-icon text-forest-600" title="Approve"><CheckIcon className="w-5 h-5" /></button>
                    <button onClick={() => setRejectingId(c.id)} className="btn-icon text-tomato-600" title="Reject"><XMarkIcon className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination pageNumber={page} totalPages={pageData.totalPages} onPageChange={setPage} />

      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/50 backdrop-blur-sm" onClick={() => setRejectingId(null)}>
          <div className="glass-card bg-white dark:bg-forest-900 p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-semibold mb-3">Reject Claim</h3>
            <label className="label-field">Reason for rejection</label>
            <textarea className="input-field" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            <div className="flex gap-3 justify-end mt-4">
              <button className="btn-secondary" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
              <button className="btn-danger" onClick={handleReject}>Reject Claim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
