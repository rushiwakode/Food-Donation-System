import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MapPinIcon, UserIcon, CalendarIcon, ClockIcon, TagIcon,
  ExclamationCircleIcon, ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import FreshnessRing from '../../components/common/FreshnessRing';
import Badge from '../../components/common/Badge';
import PageLoader from '../../components/common/PageLoader';
import donationService from '../../services/donationService';
import ngoService from '../../services/ngoService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime, getTimeUntilExpiry } from '../../utils/formatters';

export default function DonationDetailPage() {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    donationService.getDonation(id).then(setDonation).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleClaim = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setClaiming(true);
    try {
      await ngoService.claimDonation({
        donationId: Number(id),
        claimMessage,
        peopleCount: peopleCount ? Number(peopleCount) : undefined,
      });
      toast.success('Donation claimed! Awaiting admin approval.');
      navigate('/ngo/claims');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to claim donation');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <PageLoader label="Loading donation details…" />;
  if (!donation) return (
    <div className="section-container py-20 text-center">
      <ExclamationCircleIcon className="w-12 h-12 text-forest-300 mx-auto mb-3" />
      <p className="text-forest-500">Donation not found.</p>
    </div>
  );

  const { text: expiryText, urgent } = getTimeUntilExpiry(donation.expiresAt);
  const canClaim = donation.status === 'APPROVED' && (!isAuthenticated || hasRole('NGO'));

  return (
    <div className="section-container py-10">
      <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-forest-500 dark:text-cream-300 hover:text-forest-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back to listings
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="relative rounded-2xl overflow-hidden bg-forest-50 dark:bg-forest-800 h-72 sm:h-96">
            {donation.primaryImageUrl ? (
              <img src={donation.primaryImageUrl} alt={donation.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">🍲</div>
            )}
            <div className="absolute top-4 left-4"><Badge status={donation.status} /></div>
          </div>

          {donation.imageUrls?.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {donation.imageUrls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
              ))}
            </div>
          )}

          <h1 className="font-display text-3xl font-semibold text-forest-900 dark:text-cream-50 mt-6">{donation.title}</h1>
          <p className="text-forest-600 dark:text-cream-300 mt-3 leading-relaxed">{donation.description || 'No additional description provided.'}</p>

          {donation.allergenInfo && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm flex items-start gap-2">
              <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <span><strong>Allergen info:</strong> {donation.allergenInfo}</span>
            </div>
          )}

          {donation.specialNotes && (
            <div className="mt-3 p-3 rounded-xl bg-forest-50 dark:bg-forest-800/50 text-forest-700 dark:text-cream-300 text-sm">
              <strong>Notes:</strong> {donation.specialNotes}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <InfoRow icon={TagIcon} label="Category" value={donation.categoryName || '—'} />
            <InfoRow icon={UserIcon} label="Food Type" value={donation.foodType?.replace('_', '-')} />
            <InfoRow icon={CalendarIcon} label="Prepared At" value={formatDateTime(donation.preparedAt)} />
            <InfoRow icon={ClockIcon} label="Expires At" value={formatDateTime(donation.expiresAt)} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card bg-white dark:bg-forest-900 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-forest-500 dark:text-cream-400 uppercase tracking-wide font-semibold">Quantity</p>
                <p className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">
                  {donation.quantity} {donation.quantityUnit?.toLowerCase()}
                </p>
              </div>
              <FreshnessRing expiresAt={donation.expiresAt} size={56} />
            </div>

            <p className={`text-sm font-medium mb-5 ${urgent ? 'text-tomato-600' : 'text-forest-600 dark:text-cream-300'}`}>
              ⏱ {expiryText}
            </p>

            <div className="space-y-3 mb-6 pb-6 border-b border-forest-900/8 dark:border-cream-100/8">
              <div className="flex items-start gap-2 text-sm">
                <UserIcon className="w-4 h-4 mt-0.5 text-forest-400 shrink-0" />
                <span className="text-forest-700 dark:text-cream-200">{donation.donorName}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPinIcon className="w-4 h-4 mt-0.5 text-forest-400 shrink-0" />
                <span className="text-forest-700 dark:text-cream-200">{donation.pickupAddress}, {donation.pickupCity}</span>
              </div>
              {donation.pickupInstructions && (
                <p className="text-xs text-forest-500 dark:text-cream-400 pl-6">{donation.pickupInstructions}</p>
              )}
            </div>

            {canClaim ? (
              hasRole('NGO') ? (
                <div className="space-y-3">
                  <div>
                    <label className="label-field !mb-1 text-xs">Estimated people you'll feed</label>
                    <input type="number" min="1" className="input-field" placeholder="e.g. 40"
                      value={peopleCount} onChange={(e) => setPeopleCount(e.target.value)} />
                  </div>
                  <div>
                    <label className="label-field !mb-1 text-xs">Message to donor (optional)</label>
                    <textarea className="input-field" rows={2} placeholder="We can pick this up by 6 PM…"
                      value={claimMessage} onChange={(e) => setClaimMessage(e.target.value)} />
                  </div>
                  <button onClick={handleClaim} disabled={claiming} className="btn-primary w-full justify-center !py-3">
                    {claiming ? 'Claiming…' : 'Claim This Donation'}
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate('/login')} className="btn-primary w-full justify-center !py-3">
                  Sign In to Claim
                </button>
              )
            ) : (
              <div className="text-center text-sm text-forest-500 dark:text-cream-300 py-3">
                {donation.status === 'CLAIMED' ? 'This donation has already been claimed.' :
                 donation.status === 'DELIVERED' ? 'This donation has been delivered.' :
                 'This donation is not currently available.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-9 h-9 rounded-lg bg-forest-50 dark:bg-forest-800 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-forest-600 dark:text-forest-400" />
      </div>
      <div>
        <p className="text-xs text-forest-500 dark:text-cream-400">{label}</p>
        <p className="text-sm font-medium text-forest-800 dark:text-cream-100">{value}</p>
      </div>
    </div>
  );
}
