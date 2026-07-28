import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon, HeartIcon, PlusIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../components/common/StatCard';
import DonationCard from '../../components/donation/DonationCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import dashboardService from '../../services/dashboardService';
import donationService from '../../services/donationService';
import { useAuth } from '../../contexts/AuthContext';

export default function DonorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      dashboardService.getDonorDashboard(),
      donationService.getMyDonations({ page: 0, size: 6 }),
    ]).then(([statsData, donationsData]) => {
      setStats(statsData);
      setRecentDonations(donationsData.content);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-forest-500 dark:text-cream-300 text-sm mt-1">Here's what's happening with your donations.</p>
        </div>
        <Link to="/donor/donations/new" className="btn-primary">
          <PlusIcon className="w-4 h-4" /> Add Donation
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Donations" value={stats?.myDonations ?? '—'} icon={ClipboardDocumentListIcon} accent="forest" />
        <StatCard label="Pending Approval" value={stats?.pendingDonations ?? '—'} icon={ClockIcon} accent="amber" />
        <StatCard label="Active Listings" value={stats?.activeDonations ?? '—'} icon={HeartIcon} accent="blue" />
        <StatCard label="Delivered" value={stats?.completedDonations ?? '—'} icon={CheckCircleIcon} accent="tomato" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-forest-900 dark:text-cream-50">Recent Donations</h2>
          <Link to="/donor/donations" className="text-sm font-medium text-forest-600 dark:text-forest-400 hover:underline">View all</Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : recentDonations.length === 0 ? (
          <EmptyState
            icon={ClipboardDocumentListIcon}
            title="No donations yet"
            description="List your first surplus food donation and help it reach someone who needs it."
            action={<Link to="/donor/donations/new" className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Your First Donation</Link>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDonations.map((d) => <DonationCard key={d.id} donation={d} linkPrefix="/donor/donations" />)}
          </div>
        )}
      </div>
    </div>
  );
}
