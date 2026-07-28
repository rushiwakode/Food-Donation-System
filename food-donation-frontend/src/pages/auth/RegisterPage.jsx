import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon, HeartIcon, BuildingStorefrontIcon, UserGroupIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { DONOR_TYPES, VEHICLE_TYPES } from '../../utils/constants';

const ROLE_OPTIONS = [
  { value: 'DONOR', label: 'Food Donor', desc: 'Restaurant, hotel, caterer, or individual', icon: BuildingStorefrontIcon },
  { value: 'NGO', label: 'NGO', desc: 'Claim and distribute donated food', icon: UserGroupIcon },
  { value: 'DELIVERY_AGENT', label: 'Delivery Agent', desc: 'Volunteer to pick up and deliver', icon: TruckIcon },
];

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'DONOR' } });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const user = await signUp(data);
      toast.success('Account created! Welcome to FoodShare.');
      const role = user.roles?.[0]?.replace('ROLE_', '').toLowerCase().replace('_', '-');
      navigate(`/${role}/dashboard`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-cream-50 dark:bg-forest-950">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-forest-800 dark:text-cream-50 mb-8 justify-center">
          <span className="w-9 h-9 rounded-xl bg-forest-700 text-cream-50 flex items-center justify-center">
            <HeartIcon className="w-5 h-5" />
          </span>
          FoodShare
        </Link>

        <div className="glass-card bg-white dark:bg-forest-900 p-8 sm:p-10">
          <h1 className="font-display text-3xl font-semibold text-forest-900 dark:text-cream-50 text-center">Join FoodShare</h1>
          <p className="text-forest-500 dark:text-cream-300 mt-2 mb-8 text-sm text-center">Choose how you'd like to help reduce food waste.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Role selector */}
            <div className="grid sm:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    selectedRole === opt.value
                      ? 'border-forest-600 bg-forest-50 dark:bg-forest-800'
                      : 'border-forest-900/10 dark:border-cream-100/10 hover:border-forest-300'
                  }`}
                >
                  <input type="radio" value={opt.value} className="sr-only" {...register('role')} />
                  <opt.icon className="w-6 h-6 text-forest-600 dark:text-forest-400 mb-2" />
                  <p className="font-semibold text-sm text-forest-900 dark:text-cream-50">{opt.label}</p>
                  <p className="text-xs text-forest-500 dark:text-cream-300 mt-0.5">{opt.desc}</p>
                </label>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label-field">Full Name</label>
                <input className={`input-field ${errors.fullName ? 'input-error' : ''}`}
                  placeholder="Enter Your Full Name" {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Too short' } })} />
                {errors.fullName && <p className="error-text">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="label-field">Phone</label>
                <input className={`input-field ${errors.phone ? 'input-error' : ''}`}
                  placeholder="Enter Mobile Number" {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone number' } })} />
                {errors.phone && <p className="error-text">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="label-field">Email Address</label>
              <input type="email" className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter Your Email" {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-11 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter Password Min. 8 characters, mixed case, number, symbol"
                  {...register('password', {
                    required: 'Password is required',
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: 'Must include uppercase, lowercase, number & symbol',
                    },
                  })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400">
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label-field">City</label>
                <input className="input-field" placeholder="Enter City" {...register('city')} />
              </div>
              <div>
                <label className="label-field">State</label>
                <input className="input-field" placeholder="Enter State" {...register('state')} />
              </div>
            </div>

            {/* Role-specific fields */}
            {selectedRole === 'DONOR' && (
              <div className="grid sm:grid-cols-2 gap-5 p-4 rounded-xl bg-forest-50 dark:bg-forest-800/50">
                <div>
                  <label className="label-field">Donor Type</label>
                  <select className="input-field" {...register('donorType')}>
                    {DONOR_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Organization (optional)</label>
                  <input className="input-field" placeholder="Restaurant / Hotel name" {...register('organization')} />
                </div>
              </div>
            )}

            {selectedRole === 'NGO' && (
              <div className="grid sm:grid-cols-2 gap-5 p-4 rounded-xl bg-forest-50 dark:bg-forest-800/50">
                <div>
                  <label className="label-field">Organization Name</label>
                  <input className={`input-field ${errors.organizationName ? 'input-error' : ''}`}
                    placeholder="Helping Hands Foundation"
                    {...register('organizationName', { required: selectedRole === 'NGO' ? 'Required for NGOs' : false })} />
                  {errors.organizationName && <p className="error-text">{errors.organizationName.message}</p>}
                </div>
                <div>
                  <label className="label-field">Registration Number</label>
                  <input className="input-field" placeholder="NGO/MH/2018/123456" {...register('registrationNumber')} />
                </div>
              </div>
            )}

            {selectedRole === 'DELIVERY_AGENT' && (
              <div className="grid sm:grid-cols-2 gap-5 p-4 rounded-xl bg-forest-50 dark:bg-forest-800/50">
                <div>
                  <label className="label-field">Vehicle Type</label>
                  <select className="input-field" {...register('vehicleType')}>
                    {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Vehicle Number (optional)</label>
                  <input className="input-field" placeholder="MH12AB1234" {...register('vehicleNumber')} />
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center !py-3">
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-forest-500 dark:text-cream-300 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-forest-700 dark:text-forest-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
