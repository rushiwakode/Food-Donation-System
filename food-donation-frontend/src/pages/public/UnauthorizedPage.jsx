import { Link } from 'react-router-dom';
import { ShieldExclamationIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream-50 dark:bg-forest-950">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-tomato-100 dark:bg-tomato-900/30 flex items-center justify-center mx-auto mb-5">
          <ShieldExclamationIcon className="w-8 h-8 text-tomato-600 dark:text-tomato-400" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">Access denied</h1>
        <p className="text-forest-500 dark:text-cream-300 mt-2 max-w-sm mx-auto">
          You don't have permission to view this page with your current account role.
        </p>
        <Link to="/" className="btn-primary mt-8 inline-flex">
          <HomeIcon className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
