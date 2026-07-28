import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import DonationCard from '../../components/donation/DonationCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import donationService from '../../services/donationService';
import categoryService from '../../services/categoryService';
import { FOOD_TYPES } from '../../utils/constants';

export default function BrowseDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [foodType, setFoodType] = useState('');
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState({ totalPages: 0, totalElements: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(() => {});
  }, []);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await donationService.searchDonations({
        query, city: city || undefined, categoryId: categoryId || undefined,
        foodType: foodType || undefined, page, size: 9,
      });
      setDonations(result.content);
      setPageData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, city, categoryId, foodType, page]);

  useEffect(() => {
    const timer = setTimeout(fetchDonations, 300);
    return () => clearTimeout(timer);
  }, [fetchDonations]);

  return (
    <div className="section-container py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-display text-4xl font-semibold text-forest-900 dark:text-cream-50">Food Available Right Now</h1>
        <p className="text-forest-500 dark:text-cream-300 mt-2">Every listing here is approved and ready to be claimed by a verified NGO.</p>
      </div>

      <div className="glass-card bg-white dark:bg-forest-900 p-4 sm:p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
            <input
              className="input-field pl-11"
              placeholder="Search by food name or description…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            />
          </div>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-secondary">
            <FunnelIcon className="w-4 h-4" /> Filters
          </button>
        </div>

        {filtersOpen && (
          <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-forest-900/8 dark:border-cream-100/8">
            <div>
              <label className="label-field !mb-1 text-xs">City</label>
              <input className="input-field" placeholder="e.g. Pune" value={city} onChange={(e) => { setCity(e.target.value); setPage(0); }} />
            </div>
            <div>
              <label className="label-field !mb-1 text-xs">Category</label>
              <select className="input-field" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field !mb-1 text-xs">Food Type</label>
              <select className="input-field" value={foodType} onChange={(e) => { setFoodType(e.target.value); setPage(0); }}>
                <option value="">All Types</option>
                {FOOD_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', '-')}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : donations.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlassIcon}
          title="No donations found"
          description="Try adjusting your search or check back soon — new listings appear throughout the day."
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((d) => <DonationCard key={d.id} donation={d} />)}
          </div>
          <Pagination pageNumber={page} totalPages={pageData.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
