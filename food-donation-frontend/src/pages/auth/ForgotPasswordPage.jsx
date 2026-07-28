import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { HeartIcon, EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import authService from '../../services/authService';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong. Please try again.');
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
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-forest-100 dark:bg-forest-800 flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="w-7 h-7 text-forest-600 dark:text-forest-400" />
              </div>
              <h1 className="font-display text-xl font-semibold text-forest-900 dark:text-cream-50">Check your inbox</h1>
              <p className="text-sm text-forest-500 dark:text-cream-300 mt-2">
                If an account exists with that email, we've sent a link to reset your password.
              </p>
              <Link to="/login" className="btn-secondary w-full justify-center mt-6">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">Reset your password</h1>
              <p className="text-sm text-forest-500 dark:text-cream-300 mt-2 mb-6">
                Enter your email and we'll send you a link to reset it.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div>
                  <label className="label-field">Email address</label>
                  <input type="email" className={`input-field ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
                  {errors.email && <p className="error-text">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center !py-3">
                  {submitting ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-forest-500 dark:text-cream-300 mt-6 hover:text-forest-700">
                <ArrowLeftIcon className="w-4 h-4" /> Back to Sign In
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
