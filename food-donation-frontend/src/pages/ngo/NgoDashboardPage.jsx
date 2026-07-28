import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ClockIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import StatCard from '../../components/common/StatCard';
import DonationCard from '../../components/donation/DonationCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import dashboardService from '../../services/dashboardService';
import donationService from '../../services/donationService';
import { useAuth } from '../../contexts/AuthContext';

export default function NgoDashboardPage() {
  const [stats, setStats] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      dashboardService.getNgoDashboard(),
      donationService.searchDonations({ page: 0, size: 6 }),
    ]).then(([statsData, donationsData]) => {
      setStats(statsData);
      setNearby(donationsData.content);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-forest-500 dark:text-cream-300 text-sm mt-1">Here's food available near you right now.</p>
        </div>
        <Link to="/ngo/browse" className="btn-primary">
          <MagnifyingGlassIcon className="w-4 h-4" /> Find Food
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Claims" value={stats?.myClaims ?? '—'} icon={HeartIcon} accent="forest" />
        <StatCard label="Pending Claims" value={stats?.pendingClaims ?? '—'} icon={ClockIcon} accent="amber" />
        <StatCard label="Active Claims" value={stats?.activeClaims ?? '—'} icon={CheckCircleIcon} accent="blue" />
        <StatCard label="Available Nearby" value={stats?.approvedDonations ?? '—'} icon={MagnifyingGlassIcon} accent="tomato" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-forest-900 dark:text-cream-50">Available Right Now</h2>
          <Link to="/ngo/browse" className="text-sm font-medium text-forest-600 dark:text-forest-400 hover:underline">View all</Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : nearby.length === 0 ? (
          <EmptyState icon={MagnifyingGlassIcon} title="Nothing available right now" description="Check back soon — new donations are listed throughout the day." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearby.map((d) => <DonationCard key={d.id} donation={d} linkPrefix="/ngo/donations" />)}
          </div>
        )}
      </div>
    </div>
  );
}
