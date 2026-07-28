import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="glass-card bg-white dark:bg-forest-900 p-6 max-w-sm w-full"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-tomato-100 dark:bg-tomato-900/40' : 'bg-forest-100 dark:bg-forest-900'}`}>
              <ExclamationTriangleIcon className={`w-6 h-6 ${danger ? 'text-tomato-600' : 'text-forest-600'}`} />
            </div>
            <h3 className="font-display text-lg font-semibold mb-1.5">{title}</h3>
            <p className="text-sm text-forest-500 dark:text-cream-300 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={onCancel}>Cancel</button>
              <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
