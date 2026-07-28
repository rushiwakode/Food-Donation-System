export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-forest-50 dark:bg-forest-900 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-forest-400 dark:text-forest-500" />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold text-forest-900 dark:text-cream-50 mb-1.5">{title}</h3>
      {description && <p className="text-forest-500 dark:text-cream-300 text-sm max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}
