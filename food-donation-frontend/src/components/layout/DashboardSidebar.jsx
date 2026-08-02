import { NavLink, useNavigate } from 'react-router-dom';
import {
  Squares2X2Icon, PlusCircleIcon, ClipboardDocumentListIcon,
  MagnifyingGlassIcon, TruckIcon, UsersIcon, BellIcon,
  UserCircleIcon, ArrowLeftOnRectangleIcon, HeartIcon,
  ChartBarIcon, TagIcon, ChatBubbleLeftRightIcon,
  DocumentChartBarIcon, IdentificationIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const NAV_BY_ROLE = {
  ADMIN: [
    { label: 'Dashboard',        to: '/admin/dashboard',         icon: Squares2X2Icon           },
    { label: 'Users',            to: '/admin/users',             icon: UsersIcon                },
    { label: 'Donations',        to: '/admin/donations',         icon: ClipboardDocumentListIcon},
    { label: 'Claims',           to: '/admin/claims',            icon: HeartIcon                },
    { label: 'Deliveries',       to: '/admin/deliveries',        icon: TruckIcon                },
    { label: 'Profile Requests', to: '/admin/profile-requests',  icon: IdentificationIcon       },
    { label: 'Categories',       to: '/admin/categories',        icon: TagIcon                  },
    { label: 'Reports',          to: '/admin/reports',           icon: DocumentChartBarIcon     },
    { label: 'Messages',         to: '/admin/messages',          icon: ChatBubbleLeftRightIcon  },
    { label: 'Notifications',    to: '/admin/notifications',     icon: BellIcon                 },
    { label: 'Profile',          to: '/admin/profile',           icon: UserCircleIcon           },
  ],
  DONOR: [
    { label: 'Dashboard',    to: '/donor/dashboard',      icon: Squares2X2Icon           },
    { label: 'Add Donation', to: '/donor/donations/new',  icon: PlusCircleIcon           },
    { label: 'My Donations', to: '/donor/donations',      icon: ClipboardDocumentListIcon},
    { label: 'Notifications',to: '/donor/notifications',  icon: BellIcon                 },
    { label: 'Profile',      to: '/donor/profile',        icon: UserCircleIcon           },
  ],
  NGO: [
    { label: 'Dashboard',    to: '/ngo/dashboard',        icon: Squares2X2Icon           },
    { label: 'Find Food',    to: '/ngo/browse',           icon: MagnifyingGlassIcon      },
    { label: 'My Claims',    to: '/ngo/claims',           icon: ClipboardDocumentListIcon},
    { label: 'Notifications',to: '/ngo/notifications',    icon: BellIcon                 },
    { label: 'Profile',      to: '/ngo/profile',          icon: UserCircleIcon           },
  ],
  DELIVERY_AGENT: [
    { label: 'Dashboard',    to: '/agent/dashboard',      icon: Squares2X2Icon           },
    { label: 'Pickups',      to: '/agent/deliveries',     icon: TruckIcon                },
    { label: 'History',      to: '/agent/history',        icon: ChartBarIcon             },
    { label: 'Notifications',to: '/agent/notifications',  icon: BellIcon                 },
    { label: 'Profile',      to: '/agent/profile',        icon: UserCircleIcon           },
  ],
};

export default function DashboardSidebar({ open, onClose }) {
  const { primaryRole, user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV_BY_ROLE[primaryRole] || [];

  const roleLabel = {
    ADMIN:          'Administrator',
    DONOR:          'Food Donor',
    NGO:            'NGO Partner',
    DELIVERY_AGENT: 'Delivery Agent',
  }[primaryRole] || primaryRole;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-40 flex flex-col
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0c4a6e 0%, #082f49 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <HeartIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-base font-bold text-white tracking-tight">FoodShare</span>
            <p className="text-white/40 text-xs leading-none mt-0.5">{roleLabel}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              end={link.to.endsWith('dashboard')}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <link.icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="shrink-0 p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {user?.profileImage
                ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                : (user?.fullName?.charAt(0) || '?')}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.fullName}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-white/50 hover:text-white hover:bg-white/10"
          >
            <ArrowLeftOnRectangleIcon style={{ width: 18, height: 18 }} className="shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}