import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { initials } from '../../utils/formatters';

const NAV_LINKS = [
  { label: 'Browse Food', to: '/browse' },
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, primaryRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const dashboardPath = primaryRole ? `/${primaryRole.toLowerCase().replace('_', '-')}/dashboard` : '/login';

  return (
    <header className="sticky top-0 z-40 glass-nav">
      <nav className="section-container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-forest-800 dark:text-cream-50">
          <span className="w-9 h-9 rounded-xl bg-forest-700 text-cream-50 flex items-center justify-center">
            <HeartIcon className="w-5 h-5" />
          </span>
          FoodShare
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'text-forest-800 dark:text-cream-50 bg-forest-50 dark:bg-forest-900'
                  : 'text-forest-600 dark:text-cream-300 hover:text-forest-800 dark:hover:text-cream-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme">
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(dashboardPath)} className="btn-secondary !py-2">
                Dashboard
              </button>
              <button
                onClick={() => navigate(dashboardPath.replace('/dashboard', '/profile'))}
                className="w-9 h-9 rounded-full bg-forest-700 text-cream-50 flex items-center justify-center text-xs font-semibold"
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials(user?.fullName)
                )}
              </button>
              <button onClick={() => { logout(); navigate('/'); }} className="text-sm font-medium text-forest-500 hover:text-tomato-600 transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !py-2">Sign In</Link>
              <Link to="/register" className="btn-primary !py-2">Donate Food</Link>
            </>
          )}
        </div>

        <button className="md:hidden btn-icon" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-forest-900/10 dark:border-cream-100/10"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="sidebar-link">
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-forest-900/10 dark:bg-cream-100/10 my-2" />
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath} onClick={() => setOpen(false)} className="sidebar-link">Dashboard</Link>
                  <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="sidebar-link text-tomato-600 text-left">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="sidebar-link">Sign In</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary justify-center mt-2">Donate Food</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
