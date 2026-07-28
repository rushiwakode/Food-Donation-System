import { motion } from 'framer-motion';
import { HeartIcon, ScaleIcon, GlobeAltIcon, UsersIcon } from '@heroicons/react/24/outline';

const VALUES = [
  { title: 'Dignity first', desc: 'Every meal we move is treated as something someone is counting on — not surplus to be processed.', icon: HeartIcon },
  { title: 'Radical transparency', desc: 'Donors see where their food went. NGOs see exactly what they\'re getting and when.', icon: ScaleIcon },
  { title: 'Local, not centralized', desc: 'We route every donation to the nearest verified NGO — speed beats scale when food is involved.', icon: GlobeAltIcon },
  { title: 'Volunteers carry it', desc: 'The last mile is run by people who choose to show up, not a logistics fleet.', icon: UsersIcon },
];

export default function AboutPage() {
  return (
    <div className="section-container py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
        <span className="text-tomato-600 dark:text-tomato-400 font-semibold text-sm tracking-wide uppercase">Our Story</span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold mt-2 text-forest-900 dark:text-cream-50 leading-tight">
          We built FoodShare because perfectly good food was going cold by 9 PM.
        </h1>
        <p className="mt-6 text-forest-600 dark:text-cream-300 leading-relaxed">
          A caterer in Pune was throwing away forty trays of food every weekend — not because no one needed it,
          but because there was no fast way to find who did. We built a system that closes that gap in minutes,
          not hours: a donor logs what's left, a verified NGO claims it, and a volunteer gets it there while it's
          still worth eating.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6 mt-16">
        {VALUES.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card p-6"
          >
            <v.icon className="w-7 h-7 text-forest-600 dark:text-forest-400 mb-3" />
            <h3 className="font-display text-lg font-semibold text-forest-900 dark:text-cream-50">{v.title}</h3>
            <p className="text-sm text-forest-500 dark:text-cream-300 mt-1.5 leading-relaxed">{v.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 card p-10 text-center bg-forest-900 dark:bg-forest-900 border-0">
        <p className="font-display text-2xl text-cream-50 max-w-xl mx-auto leading-snug">
          "The best food rescue platform is the one that disappears — donors and NGOs barely notice it, because the handoff is just that smooth."
        </p>
      </div>
    </div>
  );
}
