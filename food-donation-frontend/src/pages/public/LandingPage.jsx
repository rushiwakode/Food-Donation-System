import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon, BuildingStorefrontIcon, TruckIcon, HeartIcon,
  ClockIcon, MapPinIcon, ShieldCheckIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';
import FreshnessRing from '../../components/common/FreshnessRing';

const STEPS = [
  {
    title: 'A kitchen has surplus',
    detail: 'Restaurants, caterers, supermarkets, and home cooks log what\'s left over before it goes to waste — quantity, photos, and a pickup window.',
    icon: BuildingStorefrontIcon,
  },
  {
    title: 'An NGO claims it',
    detail: 'Verified NGOs browse what\'s nearby and claim donations that match how many people they can feed today.',
    icon: HeartIcon,
  },
  {
    title: 'A volunteer delivers it',
    detail: 'A delivery agent picks up the food while it\'s still fresh and confirms drop-off with a one-time code.',
    icon: TruckIcon,
  },
];

const STATS = [
  { label: 'Meals rescued', value: '48,200+' },
  { label: 'Partner NGOs', value: '310' },
  { label: 'Cities covered', value: '24' },
  { label: 'Avg. pickup time', value: '38 min' },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-forest-50 via-cream-50 to-cream-50 dark:from-forest-900 dark:via-forest-950 dark:to-forest-950" />
        <div className="section-container relative pt-16 pb-24 sm:pt-24 sm:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 badge badge-success mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" />
              Live in 24 cities
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold leading-[1.05] text-forest-900 dark:text-cream-50">
              Good food shouldn't <em className="italic text-tomato-600">go cold</em> in a bin.
            </h1>
            <p className="mt-6 text-lg text-forest-600 dark:text-cream-300 max-w-xl leading-relaxed">
              FoodShare connects kitchens with surplus to NGOs that feed people, and volunteers who close the gap between them — usually within the hour.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary !px-7 !py-3.5 text-base">
                Start Donating <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link to="/browse" className="btn-outline !px-7 !py-3.5 text-base">
                Browse Available Food
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-semibold text-forest-800 dark:text-cream-50">{s.value}</p>
                  <p className="text-xs text-forest-500 dark:text-cream-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            {/* Signature demo card: a live "freshness ring" donation preview */}
            <div className="glass-card p-6 max-w-sm mx-auto animate-float">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-forest-500 dark:text-cream-400 uppercase tracking-wide">Sharma Restaurant · Pune</p>
                  <h3 className="font-display text-xl font-semibold mt-1 text-forest-900 dark:text-cream-50">Veg Thali Trays (40 servings)</h3>
                </div>
                <FreshnessRing expiresAt={new Date(Date.now() + 1000 * 60 * 90).toISOString()} size={52} />
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm text-forest-500 dark:text-cream-300">
                <MapPinIcon className="w-4 h-4" /> MG Road, Camp Area — 1.4 km away
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm text-tomato-600 dark:text-tomato-400 font-medium">
                <ClockIcon className="w-4 h-4" /> Expires in 1h 30m — claim soon
              </div>
              <button className="btn-primary w-full mt-5 justify-center">Claim This Donation</button>
            </div>
            <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-tomato-200/40 dark:bg-tomato-900/20 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-forest-200/50 dark:bg-forest-800/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-container py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-tomato-600 dark:text-tomato-400 font-semibold text-sm tracking-wide uppercase">How it works</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2 text-forest-900 dark:text-cream-50">
            From kitchen counter to dinner plate
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-7"
            >
              <div className="w-12 h-12 rounded-xl bg-forest-50 dark:bg-forest-900 flex items-center justify-center mb-5">
                <step.icon className="w-6 h-6 text-forest-600 dark:text-forest-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-forest-900 dark:text-cream-50 mb-2">{step.title}</h3>
              <p className="text-sm text-forest-500 dark:text-cream-300 leading-relaxed">{step.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-forest-900 dark:bg-forest-950 py-16">
        <div className="section-container grid sm:grid-cols-3 gap-8 text-cream-100">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-forest-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-semibold mb-1">Verified NGOs only</h4>
              <p className="text-sm text-cream-300/80">Every NGO is manually reviewed before they can claim a single donation.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ClockIcon className="w-6 h-6 text-forest-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-semibold mb-1">Built around expiry</h4>
              <p className="text-sm text-cream-300/80">Every listing carries a countdown — so the food that needs to move first, moves first.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ChartBarIcon className="w-6 h-6 text-forest-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-semibold mb-1">Full traceability</h4>
              <p className="text-sm text-cream-300/80">From the kitchen to the final delivery, every handoff is logged and confirmed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-container py-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-forest-900 dark:text-cream-50 max-w-xl mx-auto">
          Got food that won't keep until tomorrow?
        </h2>
        <p className="mt-4 text-forest-600 dark:text-cream-300 max-w-md mx-auto">
          List it in under two minutes. The nearest NGO will know within seconds.
        </p>
        <Link to="/register" className="btn-primary !px-8 !py-3.5 text-base mt-8 inline-flex">
          Create a Free Account <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
