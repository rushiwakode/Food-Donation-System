import { NavLink, useNavigate } from 'react-router-dom';
import {
  Squares2X2Icon, PlusCircleIcon, ClipboardDocumentListIcon, MagnifyingGlassIcon,
  TruckIcon, UsersIcon, BellIcon, UserCircleIcon, ArrowLeftOnRectangleIcon,
  HeartIcon, ChartBarIcon, TagIcon, ChatBubbleLeftRightIcon, DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const NAV_BY_ROLE = {
  ADMIN: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: Squares2X2Icon },
    { label: 'Users', to: '/admin/users', icon: UsersIcon },
    { label: 'Donations', to: '/admin/donations', icon: ClipboardDocumentListIcon },
    { label: 'Claims', to: '/admin/claims', icon: HeartIcon },
    { label: 'Deliveries', to: '/admin/deliveries', icon: TruckIcon },
    { label: 'Categories', to: '/admin/categories', icon: TagIcon },
    { label: 'Reports', to: '/admin/reports', icon: DocumentChartBarIcon },
    { label: 'Messages', to: '/admin/messages', icon: ChatBubbleLeftRightIcon },
  ],
  DONOR: [
    { label: 'Dashboard', to: '/donor/dashboard', icon: Squares2X2Icon },
    { label: 'Add Donation', to: '/donor/donations/new', icon: PlusCircleIcon },
    { label: 'My Donations', to: '/donor/donations', icon: ClipboardDocumentListIcon },
    { label: 'Notifications', to: '/donor/notifications', icon: BellIcon },
    { label: 'Profile', to: '/donor/profile', icon: UserCircleIcon },
  ],
  NGO: [
    { label: 'Dashboard', to: '/ngo/dashboard', icon: Squares2X2Icon },
    { label: 'Find Food', to: '/ngo/browse', icon: MagnifyingGlassIcon },
    { label: 'My Claims', to: '/ngo/claims', icon: ClipboardDocumentListIcon },
    { label: 'Notifications', to: '/ngo/notifications', icon: BellIcon },
    { label: 'Profile', to: '/ngo/profile', icon: UserCircleIcon },
  ],
  DELIVERY_AGENT: [
    { label: 'Dashboard', to: '/agent/dashboard', icon: Squares2X2Icon },
    { label: 'Assigned Pickups', to: '/agent/deliveries', icon: TruckIcon },
    { label: 'Delivery History', to: '/agent/history', icon: ChartBarIcon },
    { label: 'Notifications', to: '/agent/notifications', icon: BellIcon },
    { label: 'Profile', to: '/agent/profile', icon: UserCircleIcon },
  ],
};

export default function DashboardSidebar({ open, onClose }) {
  const { primaryRole, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV_BY_ROLE[primaryRole] || [];

  return (
    <>
      {open && <div className="fixed inset-0 bg-forest-950/50 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-forest-950 border-r border-forest-900/8 dark:border-cream-100/8 flex flex-col z-40 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-forest-900/8 dark:border-cream-100/8">
          <span className="w-9 h-9 rounded-xl bg-forest-700 text-cream-50 flex items-center justify-center">
            <HeartIcon className="w-5 h-5" />
          </span>
          <span className="font-display text-lg font-bold text-forest-800 dark:text-cream-50">FoodShare</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              end={link.to.endsWith('dashboard')}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-forest-900/8 dark:border-cream-100/8">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="sidebar-link w-full text-tomato-600 dark:text-tomato-400 hover:bg-tomato-50 dark:hover:bg-tomato-900/20"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
