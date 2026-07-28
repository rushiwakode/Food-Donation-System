import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream-50 dark:bg-forest-950">
      <div className="text-center">
        <p className="font-display text-8xl font-bold text-forest-200 dark:text-forest-800">404</p>
        <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mt-2">Page not found</h1>
        <p className="text-forest-500 dark:text-cream-300 mt-2 max-w-sm mx-auto">
          The page you're looking for doesn't exist, or may have moved.
        </p>
        <Link to="/" className="btn-primary mt-8 inline-flex">
          <HomeIcon className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
