import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon, BuildingStorefrontIcon, HeartIcon, TruckIcon,
  ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon,
  XCircleIcon, ArrowTrendingUpIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import adminService from '../../services/adminService';

const COLORS = ['#0ea5e9','#8b5cf6','#10b981','#f59e0b','#f43f5e'];

// Clickable stat card — navigates to admin detail page on click
function ClickableStatCard({ label, value, icon: Icon, gradient, onClick, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onClick}
      className={`rounded-2xl p-5 text-white cursor-pointer transition-all duration-300 ${gradient}`}
      style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium">{label}</p>
          <p className="font-display text-3xl font-bold mt-1">{value ?? '—'}</p>
          {trend && <p className="text-white/60 text-xs mt-1">{trend}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <ChevronRightIcon className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminService.getDashboard().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-64" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({length:8}).map((_,i) => <div key={i} className="skeleton h-32 w-full rounded-2xl" />)}
      </div>
    </div>
  );

  const userCards = [
    { label: 'Total Users',       value: stats?.totalUsers,   icon: UsersIcon,               gradient: 'bg-gradient-to-br from-primary-500 to-primary-700',   path: '/admin/users' },
    { label: 'Total Donors',      value: stats?.totalDonors,  icon: BuildingStorefrontIcon,   gradient: 'bg-gradient-to-br from-violet-500 to-violet-700',       path: '/admin/users?role=DONOR' },
    { label: 'Verified NGOs',     value: stats?.totalNgos,    icon: HeartIcon,                gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700',     path: '/admin/users?role=NGO' },
    { label: 'Delivery Agents',   value: stats?.totalAgents,  icon: TruckIcon,                gradient: 'bg-gradient-to-br from-amber-500 to-amber-700',         path: '/admin/users?role=DELIVERY_AGENT' },
  ];

  const donationCards = [
    { label: 'Total Donations',   value: stats?.totalDonations,      icon: ClipboardDocumentListIcon, gradient: 'bg-gradient-to-br from-sky-500 to-sky-700',           path: '/admin/donations' },
    { label: 'Pending Approval',  value: stats?.pendingDonations,    icon: ClockIcon,                 gradient: 'bg-gradient-to-br from-orange-500 to-orange-700',      path: '/admin/donations?status=PENDING' },
    { label: 'Delivered',         value: stats?.completedDonations,  icon: CheckCircleIcon,           gradient: 'bg-gradient-to-br from-green-500 to-green-700',        path: '/admin/donations?status=DELIVERED' },
    { label: 'Expired',           value: stats?.expiredDonations,    icon: XCircleIcon,               gradient: 'bg-gradient-to-br from-rose-500 to-rose-700',          path: '/admin/donations?status=EXPIRED' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Click any card to view detailed records
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
          <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
          Live data
        </div>
      </div>

      {/* USER STATS */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Users
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {userCards.map((c, i) => (
            <motion.div key={c.label} transition={{ delay: i * 0.05 }}>
              <ClickableStatCard {...c} onClick={() => navigate(c.path)} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* DONATION STATS */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Donations
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {donationCards.map((c, i) => (
            <motion.div key={c.label} transition={{ delay: i * 0.05 }}>
              <ClickableStatCard {...c} onClick={() => navigate(c.path)} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* DELIVERY + CLAIMS ROW */}
      <div className="grid sm:grid-cols-3 gap-4">
        <ClickableStatCard
          label="Total Deliveries"
          value={stats?.totalDeliveries}
          icon={TruckIcon}
          gradient="bg-gradient-to-br from-cyan-500 to-cyan-700"
          onClick={() => navigate('/admin/deliveries')}
        />
        <ClickableStatCard
          label="Completed Deliveries"
          value={stats?.completedDeliveries}
          icon={CheckCircleIcon}
          gradient="bg-gradient-to-br from-teal-500 to-teal-700"
          onClick={() => navigate('/admin/deliveries?status=DELIVERED')}
        />
        <ClickableStatCard
          label="Pending Claims"
          value={stats?.pendingClaims}
          icon={HeartIcon}
          gradient="bg-gradient-to-br from-pink-500 to-pink-700"
          onClick={() => navigate('/admin/claims?status=PENDING')}
        />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-1">
            Monthly Donation Trend
          </h3>
          <p className="text-slate-400 text-xs mb-5">Donations created per month this year</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats?.monthlyDonations || []}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background:'rgba(15,23,42,0.9)', border:'1px solid rgba(14,165,233,0.2)', borderRadius:12, fontSize:12 }}
                labelStyle={{ color:'#94a3b8' }}
                itemStyle={{ color:'#38bdf8' }}
              />
              <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#grad1)" dot={false} activeDot={{ r:5, fill:'#0ea5e9' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-1">By Status</h3>
          <p className="text-slate-400 text-xs mb-5">Donation status distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats?.donationsByStatus || []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {(stats?.donationsByStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:'rgba(15,23,42,0.9)', border:'none', borderRadius:10, fontSize:11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {(stats?.donationsByStatus || []).map((s, i) => (
              <div key={s.status} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.status}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* City Bar Chart */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-1">Donations by City</h3>
        <p className="text-slate-400 text-xs mb-5">Top cities by donation count</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={(stats?.donationsByCity || []).slice(0, 8)}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#0ea5e9" stopOpacity={1} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
            <XAxis dataKey="city" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background:'rgba(15,23,42,0.9)', border:'none', borderRadius:10, fontSize:11 }} />
            <Bar dataKey="count" fill="url(#barGrad)" radius={[6,6,0,0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}