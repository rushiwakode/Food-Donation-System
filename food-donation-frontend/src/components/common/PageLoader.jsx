import Spinner from './Spinner';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-forest-500 dark:text-cream-300 text-sm font-medium">{label}</p>
    </div>
  );
}
