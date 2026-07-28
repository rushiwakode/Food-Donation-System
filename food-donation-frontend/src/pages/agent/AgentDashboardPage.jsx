import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TruckIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import dashboardService from '../../services/dashboardService';
import deliveryService from '../../services/deliveryService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime } from '../../utils/formatters';

export default function AgentDashboardPage() {
  const [stats, setStats] = useState(null);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      dashboardService.getAgentDashboard(),
      deliveryService.getMyDeliveries({ status: 'ASSIGNED', page: 0, size: 5 }),
    ]).then(([statsData, deliveriesData]) => {
      setStats(statsData);
      setActiveDeliveries(deliveriesData.content);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-forest-500 dark:text-cream-300 text-sm mt-1">Here are your current pickups and recent stats.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total Deliveries" value={stats?.myDeliveries ?? '—'} icon={TruckIcon} accent="forest" />
        <StatCard label="Completed" value={stats?.completedDeliveries ?? '—'} icon={CheckCircleIcon} accent="tomato" />
        <StatCard label="Active Pickups" value={activeDeliveries.length} icon={ClockIcon} accent="amber" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-forest-900 dark:text-cream-50">Assigned Pickups</h2>
          <Link to="/agent/deliveries" className="text-sm font-medium text-forest-600 dark:text-forest-400 hover:underline">View all</Link>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-24 w-full" />)}</div>
        ) : activeDeliveries.length === 0 ? (
          <EmptyState icon={TruckIcon} title="No active pickups" description="New delivery assignments will appear here once an admin assigns you." />
        ) : (
          <div className="space-y-3">
            {activeDeliveries.map((d) => (
              <Link key={d.id} to={`/agent/deliveries/${d.id}`} className="card p-5 flex items-center justify-between block hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50">{d.donationTitle}</h3>
                  <p className="text-sm text-forest-500 dark:text-cream-300 mt-1">{d.pickupAddress}, {d.pickupCity}</p>
                  <p className="text-xs text-forest-400 dark:text-cream-400 mt-1">Assigned {formatDateTime(d.assignedAt)}</p>
                </div>
                <Badge status={d.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
