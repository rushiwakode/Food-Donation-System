import { useState, useEffect } from 'react';
import { DocumentChartBarIcon, ArrowDownTrayIcon, UsersIcon, ClipboardDocumentListIcon, TruckIcon, HeartIcon } from '@heroicons/react/24/outline';
import StatCard from '../../components/common/StatCard';
import adminService from '../../services/adminService';

const REPORT_TYPES = [
  { value: 'DONATIONS', label: 'Donations Report', desc: 'All donation listings with status breakdown' },
  { value: 'USERS', label: 'Users Report', desc: 'User registrations by role and status' },
  { value: 'DELIVERIES', label: 'Deliveries Report', desc: 'Delivery performance and completion rates' },
  { value: 'NGO_ACTIVITY', label: 'NGO Activity Report', desc: 'Claims and fulfillment by NGO' },
];

export default function AdminReportsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.getDashboard().then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mb-1">Reports</h1>
      <p className="text-forest-500 dark:text-cream-300 text-sm mb-6">Generate and export operational summaries.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Donations" value={stats?.totalDonations ?? '—'} icon={ClipboardDocumentListIcon} accent="forest" />
        <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} icon={UsersIcon} accent="blue" />
        <StatCard label="Completed Deliveries" value={stats?.completedDeliveries ?? '—'} icon={TruckIcon} accent="tomato" />
        <StatCard label="Pending Claims" value={stats?.pendingClaims ?? '—'} icon={HeartIcon} accent="purple" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {REPORT_TYPES.map((r) => (
          <div key={r.value} className="card p-6 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-800 flex items-center justify-center shrink-0">
                <DocumentChartBarIcon className="w-5 h-5 text-forest-600 dark:text-forest-400" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50">{r.label}</h3>
                <p className="text-sm text-forest-500 dark:text-cream-300 mt-1">{r.desc}</p>
              </div>
            </div>
            <button className="btn-icon shrink-0" title="Download CSV (coming soon)">
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
