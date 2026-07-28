import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { TruckIcon, UserPlusIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import adminService from '../../services/adminService';
import { formatDateTime } from '../../utils/formatters';

const TABS = ['ALL', 'UNASSIGNED', 'ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'];

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0 });
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('UNASSIGNED');
  const [loading, setLoading] = useState(true);
  const [assigningClaim, setAssigningClaim] = useState(null);
  const [agentId, setAgentId] = useState('');
  const [agents, setAgents] = useState([]);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getAllDeliveries({
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

  useEffect(() => {
    if (assigningClaim) {
      adminService.getAllUsers({ role: 'DELIVERY_AGENT', size: 100 }).then((res) => {
        setAgents(res.content.filter((a) => a.status === 'ACTIVE'));
      }).catch(() => {});
    }
  }, [assigningClaim]);

  const handleAssign = async () => {
    if (!agentId) { toast.error('Please select an agent'); return; }
    try {
      await adminService.assignAgent(assigningClaim, agentId);
      toast.success('Agent assigned successfully');
      setAssigningClaim(null);
      setAgentId('');
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign agent');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mb-6">Delivery Management</h1>

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
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : deliveries.length === 0 ? (
        <EmptyState icon={TruckIcon} title="No deliveries found" description="Deliveries matching this filter will appear here." />
      ) : (
        <div className="space-y-3">
          {deliveries.map((d) => (
            <div key={d.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50">{d.donationTitle}</h3>
                <p className="text-sm text-forest-500 dark:text-cream-300 flex items-center gap-1 mt-1">
                  <MapPinIcon className="w-3.5 h-3.5" /> {d.pickupAddress}, {d.pickupCity}
                </p>
                {d.agentName && <p className="text-xs text-forest-400 dark:text-cream-400 mt-1">Agent: {d.agentName}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge status={d.status} />
                {d.status === 'UNASSIGNED' && (
                  <button onClick={() => setAssigningClaim(d.claimId)} className="btn-secondary !py-2">
                    <UserPlusIcon className="w-4 h-4" /> Assign Agent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination pageNumber={page} totalPages={pageData.totalPages} onPageChange={setPage} />

      {assigningClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/50 backdrop-blur-sm" onClick={() => setAssigningClaim(null)}>
          <div className="glass-card bg-white dark:bg-forest-900 p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-semibold mb-3">Assign Delivery Agent</h3>
            <label className="label-field">Select Agent</label>
            <select className="input-field" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
              <option value="">Choose an agent…</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.fullName} ({a.city})</option>)}
            </select>
            <div className="flex gap-3 justify-end mt-5">
              <button className="btn-secondary" onClick={() => { setAssigningClaim(null); setAgentId(''); }}>Cancel</button>
              <button className="btn-primary" onClick={handleAssign}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
