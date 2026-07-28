import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon, Cog6ToothIcon, BellIcon,
  ArrowLeftOnRectangleIcon, ShieldCheckIcon,
  ChevronDownIcon, KeyIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { initials } from '../../utils/formatters';

export default function ProfileDropdown() {
  const [open, setOpen]   = useState(false);
  const ref               = useRef(null);
  const { user, primaryRole, logout } = useAuth();
  const navigate          = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const rolePrefix = primaryRole?.toLowerCase().replace('_', '-') || 'donor';

  const menuItems = [
    {
      group: 'Account',
      items: [
        {
          icon: UserCircleIcon,
          label: 'My Profile',
          desc: 'View & edit your details',
          path: `/${rolePrefix}/profile`,
          color: 'text-primary-500',
        },
        {
          icon: BellIcon,
          label: 'Notifications',
          desc: 'View all notifications',
          path: `/${rolePrefix}/notifications`,
          color: 'text-accent-500',
        },
        {
          icon: KeyIcon,
          label: 'Change Password',
          desc: 'Update your password',
          path: `/${rolePrefix}/profile#password`,
          color: 'text-amber-500',
        },
      ],
    },
    {
      group: 'Preferences',
      items: [
        {
          icon: Cog6ToothIcon,
          label: 'Settings',
          desc: 'Account preferences',
          path: `/${rolePrefix}/profile#settings`,
          color: 'text-slate-500',
        },
      ],
    },
  ];

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  const roleLabel = {
    ADMIN:          'Administrator',
    DONOR:          'Food Donor',
    NGO:            'NGO Partner',
    DELIVERY_AGENT: 'Delivery Agent',
  }[primaryRole] || primaryRole;

  return (
    <div ref={ref} className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-xs font-bold shadow-glow-sm overflow-hidden ring-2 ring-white dark:ring-slate-900">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              initials(user?.fullName)
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
        </div>

        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
            {user?.fullName?.split(' ')[0] || 'User'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{roleLabel}</p>
        </div>

        <ChevronDownIcon className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-premium py-2 z-50"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-sm font-bold overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials(user?.fullName)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                    <ShieldCheckIcon className="w-3 h-3" />
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Groups */}
            {menuItems.map((group, gi) => (
              <div key={group.group}>
                {gi > 0 && <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5 mx-3" />}
                <p className="px-4 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                  {group.group}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 flex items-center justify-center transition-colors`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            ))}

            {/* Logout */}
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5 mx-3" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-danger-100 dark:group-hover:bg-danger-900/30 flex items-center justify-center transition-colors">
                <ArrowLeftOnRectangleIcon className="w-4 h-4 text-danger-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-danger-600 dark:text-danger-400">Sign Out</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">End your session</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}