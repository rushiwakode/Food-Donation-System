export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' };
  return (
    <div
      className={`${sizes[size]} rounded-full border-forest-200 border-t-forest-600 dark:border-forest-800 dark:border-t-forest-400 animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
