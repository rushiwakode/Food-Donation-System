import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPinIcon, ArrowLeftIcon, CheckCircleIcon, TruckIcon } from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import PageLoader from '../../components/common/PageLoader';
import deliveryService from '../../services/deliveryService';
import { formatDateTime } from '../../utils/formatters';

const STEPS = ['ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

export default function DeliveryDetailPage() {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDelivery = () => {
    deliveryService.getDelivery(id).then(setDelivery).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDelivery(); }, [id]);

  const handleStatusUpdate = async (status) => {
    setSubmitting(true);
    try {
      await deliveryService.updateStatus(id, status);
      toast.success('Status updated');
      fetchDelivery();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit pickup OTP'); return; }
    setSubmitting(true);
    try {
      await deliveryService.confirmPickup(id, otp);
      toast.success('Pickup confirmed!');
      setOtp('');
      fetchDelivery();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit delivery OTP'); return; }
    setSubmitting(true);
    try {
      await deliveryService.confirmDelivery(id, otp);
      toast.success('Delivery confirmed! Great work.');
      setOtp('');
      fetchDelivery();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!delivery) return <p className="text-center text-forest-500 py-20">Delivery not found.</p>;

  const currentStepIdx = STEPS.indexOf(delivery.status);

  return (
    <div className="max-w-2xl">
      <Link to="/agent/deliveries" className="inline-flex items-center gap-1.5 text-sm text-forest-500 dark:text-cream-300 hover:text-forest-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back to pickups
      </Link>

      <div className="card p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">{delivery.donationTitle}</h1>
            <p className="text-sm text-forest-500 dark:text-cream-300 flex items-center gap-1 mt-1.5">
              <MapPinIcon className="w-4 h-4" /> {delivery.pickupAddress}, {delivery.pickupCity}
            </p>
          </div>
          <Badge status={delivery.status} />
        </div>

        {!['FAILED', 'CANCELLED'].includes(delivery.status) && (
          <div className="flex items-center mb-8">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i <= currentStepIdx ? 'bg-forest-600 text-cream-50' : 'bg-forest-100 dark:bg-forest-800 text-forest-400'
                }`}>
                  {i < currentStepIdx ? <CheckCircleIcon className="w-5 h-5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIdx ? 'bg-forest-600' : 'bg-forest-100 dark:bg-forest-800'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-5">
          {delivery.status === 'ASSIGNED' && (
            <ActionBox title="Start Pickup" desc="Tap below once you're heading to the pickup location.">
              <button onClick={() => handleStatusUpdate('PICKUP_STARTED')} disabled={submitting} className="btn-primary w-full justify-center">
                Start Pickup Journey
              </button>
            </ActionBox>
          )}

          {delivery.status === 'PICKUP_STARTED' && (
            <ActionBox title="Confirm Pickup" desc="Ask the donor for the 6-digit pickup code and enter it below.">
              <OtpInput otp={otp} setOtp={setOtp} />
              <button onClick={handleConfirmPickup} disabled={submitting} className="btn-primary w-full justify-center mt-3">
                Confirm Pickup
              </button>
            </ActionBox>
          )}

          {delivery.status === 'PICKED_UP' && (
            <ActionBox title="Start Delivery" desc="Food is in hand — head to the NGO now.">
              <button onClick={() => handleStatusUpdate('IN_TRANSIT')} disabled={submitting} className="btn-primary w-full justify-center">
                Start Delivery Journey
              </button>
            </ActionBox>
          )}

          {delivery.status === 'IN_TRANSIT' && (
            <ActionBox title="Confirm Delivery" desc="Ask the NGO for the 6-digit delivery code and enter it below.">
              <OtpInput otp={otp} setOtp={setOtp} />
              <button onClick={handleConfirmDelivery} disabled={submitting} className="btn-primary w-full justify-center mt-3">
                Confirm Delivery
              </button>
            </ActionBox>
          )}

          {delivery.status === 'DELIVERED' && (
            <div className="text-center py-6">
              <CheckCircleIcon className="w-14 h-14 text-forest-500 mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold text-forest-900 dark:text-cream-50">Delivery Complete!</h3>
              <p className="text-sm text-forest-500 dark:text-cream-300 mt-1">Delivered on {formatDateTime(delivery.deliveredAt)}</p>
            </div>
          )}

          {['ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT'].includes(delivery.status) && (
            <button
              onClick={() => handleStatusUpdate('FAILED')}
              disabled={submitting}
              className="text-sm text-tomato-600 hover:text-tomato-700 font-medium w-full text-center pt-2"
            >
              Report an issue with this delivery
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBox({ title, desc, children }) {
  return (
    <div className="p-5 rounded-xl bg-forest-50 dark:bg-forest-800/50">
      <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50 flex items-center gap-2">
        <TruckIcon className="w-5 h-5 text-forest-600 dark:text-forest-400" /> {title}
      </h3>
      <p className="text-sm text-forest-500 dark:text-cream-300 mt-1 mb-4">{desc}</p>
      {children}
    </div>
  );
}

function OtpInput({ otp, setOtp }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      value={otp}
      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
      placeholder="• • • • • •"
      className="input-field text-center text-2xl tracking-[0.5em] font-mono"
    />
  );
}
