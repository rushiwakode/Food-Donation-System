import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { HeartIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import authService from '../../services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset link is invalid or missing a token');
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPassword({ token, newPassword: data.newPassword });
      toast.success('Password reset successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset link is invalid or has expired');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream-50 dark:bg-forest-950">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-forest-800 dark:text-cream-50 mb-10 justify-center">
          <span className="w-9 h-9 rounded-xl bg-forest-700 text-cream-50 flex items-center justify-center">
            <HeartIcon className="w-5 h-5" />
          </span>
          FoodShare
        </Link>

        <div className="glass-card bg-white dark:bg-forest-900 p-8">
          <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">Set a new password</h1>
          <p className="text-sm text-forest-500 dark:text-cream-300 mt-2 mb-6">Choose something secure you haven't used before.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="label-field">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-11 ${errors.newPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  {...register('newPassword', {
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
              {errors.newPassword && <p className="error-text">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="label-field">Confirm Password</label>
              <input
                type="password"
                className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === newPassword || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center !py-3">
              {submitting ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
