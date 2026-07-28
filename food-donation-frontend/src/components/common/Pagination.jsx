import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ pageNumber, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, pageNumber - 2);
  const end = Math.min(totalPages - 1, pageNumber + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6">
      <button
        className="btn-icon disabled:opacity-30"
        disabled={pageNumber === 0}
        onClick={() => onPageChange(pageNumber - 1)}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      {start > 0 && <span className="px-2 text-forest-400">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            p === pageNumber
              ? 'bg-forest-700 text-cream-50'
              : 'hover:bg-forest-50 dark:hover:bg-forest-800 text-forest-600 dark:text-cream-300'
          }`}
        >
          {p + 1}
        </button>
      ))}
      {end < totalPages - 1 && <span className="px-2 text-forest-400">…</span>}
      <button
        className="btn-icon disabled:opacity-30"
        disabled={pageNumber >= totalPages - 1}
        onClick={() => onPageChange(pageNumber + 1)}
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
