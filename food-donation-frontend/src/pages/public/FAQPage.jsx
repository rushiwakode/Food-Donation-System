import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const FAQS = [
  {
    q: 'Who can register as a donor?',
    a: 'Anyone with surplus food can donate — restaurants, hotels, supermarkets, caterers, event organizers, or individuals. Registration is free and takes about two minutes.',
  },
  {
    q: 'How are NGOs verified?',
    a: 'Every NGO submits a registration number and description during sign-up. An admin reviews and approves the account before it can claim any donation, so donors always know who they\'re giving to.',
  },
  {
    q: 'What happens after a donation is claimed?',
    a: 'An admin assigns a delivery agent, who receives a pickup OTP and delivery OTP. The donor and NGO get notified at every step — claimed, picked up, and delivered.',
  },
  {
    q: 'Is there a minimum quantity to donate?',
    a: 'No. List whatever you have left over, whether it\'s 5 servings or 500. NGOs filter by quantity to match what they can use.',
  },
  {
    q: 'How quickly does a donation need to be picked up?',
    a: 'You set the expiry time when you create the listing. The freshness ring on every card shows exactly how much time is left, so NGOs prioritize the most urgent donations first.',
  },
  {
    q: 'Can I become a delivery volunteer without a vehicle?',
    a: 'Yes — you can register with "Walk" as your vehicle type if you\'re covering deliveries on foot within a short radius.',
  },
  {
    q: 'Is FoodShare free to use?',
    a: 'Yes, completely free for donors, NGOs, and delivery volunteers. We don\'t charge fees or take a cut of anything.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="section-container py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-semibold text-forest-900 dark:text-cream-50">Frequently Asked Questions</h1>
        <p className="text-forest-500 dark:text-cream-300 mt-2">Everything you need to know before you get started.</p>
      </div>

      <div className="space-y-3">
        {FAQS.map((item, i) => (
          <div key={item.q} className="card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-forest-900 dark:text-cream-50">{item.q}</span>
              <ChevronDownIcon className={`w-5 h-5 text-forest-400 shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-forest-600 dark:text-cream-300 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
