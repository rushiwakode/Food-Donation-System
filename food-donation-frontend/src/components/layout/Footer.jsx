import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-cream-200 mt-24">
      <div className="section-container py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-cream-50 mb-3">
            <span className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center">
              <HeartIcon className="w-4 h-4" />
            </span>
            FoodShare
          </Link>
          <p className="text-sm text-cream-300/80 leading-relaxed">
            Connecting surplus food with the people who need it — one rescued meal at a time.
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold text-cream-50 mb-3 text-sm tracking-wide uppercase">Platform</h4>
          <ul className="space-y-2 text-sm text-cream-300/80">
            <li><Link to="/browse" className="hover:text-cream-50 transition-colors">Browse Donations</Link></li>
            <li><Link to="/register" className="hover:text-cream-50 transition-colors">Become a Donor</Link></li>
            <li><Link to="/register" className="hover:text-cream-50 transition-colors">Register as NGO</Link></li>
            <li><Link to="/register" className="hover:text-cream-50 transition-colors">Join as Delivery Agent</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-cream-50 mb-3 text-sm tracking-wide uppercase">Company</h4>
          <ul className="space-y-2 text-sm text-cream-300/80">
            <li><Link to="/about" className="hover:text-cream-50 transition-colors">About Us</Link></li>
            <li><Link to="/faq" className="hover:text-cream-50 transition-colors">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-cream-50 transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-cream-50 mb-3 text-sm tracking-wide uppercase">Reach Us</h4>
          <ul className="space-y-2 text-sm text-cream-300/80">
            <li>admin@fooddonation.com</li>
            <li>+91 99999 99999</li>
            <li>Pune, Maharashtra, India</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="section-container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream-300/60">
          <p>© {new Date().getFullYear()} FoodShare. All rights reserved.</p>
          <p>Built to reduce food waste, one donation at a time.</p>
        </div>
      </div>
    </footer>
  );
}
