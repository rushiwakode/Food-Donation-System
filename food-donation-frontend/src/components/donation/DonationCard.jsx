import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import FreshnessRing from '../common/FreshnessRing';
import Badge from '../common/Badge';
import { getTimeUntilExpiry } from '../../utils/formatters';

export default function DonationCard({ donation, linkPrefix = '/browse' }) {
  const { text: expiryText, urgent } = getTimeUntilExpiry(donation.expiresAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card overflow-hidden group"
    >
      <Link to={`${linkPrefix}/${donation.id}`}>
        <div className="relative h-40 bg-forest-50 dark:bg-forest-800 overflow-hidden">
          {donation.primaryImageUrl ? (
            <img
              src={donation.primaryImageUrl}
              alt={donation.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-forest-300 dark:text-forest-600 font-display text-4xl">
              🍲
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge status={donation.status} />
          </div>
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-forest-900/90 backdrop-blur rounded-full p-0.5">
            <FreshnessRing expiresAt={donation.expiresAt} size={40} strokeWidth={3} />
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50 truncate">{donation.title}</h3>
          <p className="text-sm text-forest-500 dark:text-cream-300 mt-1 flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5" /> {donation.donorName}
          </p>
          <p className="text-sm text-forest-500 dark:text-cream-300 mt-1 flex items-center gap-1">
            <MapPinIcon className="w-3.5 h-3.5" /> {donation.pickupCity}
          </p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-forest-900/8 dark:border-cream-100/8">
            <span className="text-sm font-semibold text-forest-700 dark:text-forest-400">
              {donation.quantity} {donation.quantityUnit?.toLowerCase()}
            </span>
            <span className={`text-xs font-medium ${urgent ? 'text-tomato-600' : 'text-forest-500 dark:text-cream-300'}`}>
              {expiryText}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
