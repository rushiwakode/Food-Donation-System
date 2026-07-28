import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bars3Icon, BellIcon, SunIcon, MoonIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ProfileDropdown from '../common/ProfileDropdown';
import notificationService from '../../services/notificationService';

export default function DashboardTopbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { primaryRole }        = useAuth();
  const location               = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Build correct notification path for each role
  const rolePrefix = primaryRole?.toLowerCase().replace('_', '-') || 'donor';
  const notifPath  = `/${rolePrefix}/notifications`;

  // Refresh unread count on every page navigation
  useEffect(() => {
    let active = true;
    notificationService.getUnreadCount()
      .then(count => { if (active) setUnreadCount(count); })
      .catch(() => {});
    return () => { active = false; };
  }, [location.pathname]);

  // Build breadcrumb labels from URL
  const crumbs = location.pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-20 h-16 glass-nav flex items-center justify-between px-4 sm:px-6">

      {/* LEFT — Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          className="btn-icon lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400" />}
              <span className={
                i === crumbs.length - 1
                  ? 'font-semibold text-slate-800 dark:text-slate-100 capitalize'
                  : 'text-slate-400 dark:text-slate-500 capitalize'
              }>
                {crumb.replace(/-/g, ' ')}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* RIGHT — Theme + Bell + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Dark mode toggle */}
        <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme">
          {theme === 'dark'
            ? <SunIcon  className="w-5 h-5 text-amber-400" />
            : <MoonIcon className="w-5 h-5 text-slate-500" />}
        </button>

        {/* Notification Bell → navigates to correct /role/notifications */}
        <Link to={notifPath} className="btn-icon relative" aria-label="Notifications">
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="notif-dot" />
          )}
        </Link>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

        {/* Profile Dropdown — imported from components/common/ProfileDropdown.jsx */}
        <ProfileDropdown />

      </div>
    </header>
  );
}