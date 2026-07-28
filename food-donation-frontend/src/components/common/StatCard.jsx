import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, accent = 'forest', trend }) {
  const accents = {
    forest: 'bg-forest-50 dark:bg-forest-900 text-forest-600 dark:text-forest-400',
    tomato: 'bg-tomato-50 dark:bg-tomato-900/30 text-tomato-600 dark:text-tomato-400',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 flex items-start justify-between"
    >
      <div>
        <p className="text-sm text-forest-500 dark:text-cream-300 font-medium">{label}</p>
        <p className="font-display text-3xl font-semibold mt-1.5 text-forest-900 dark:text-cream-50">{value}</p>
        {trend && <p className="text-xs text-forest-400 dark:text-cream-400 mt-1">{trend}</p>}
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accents[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </motion.div>
  );
}
