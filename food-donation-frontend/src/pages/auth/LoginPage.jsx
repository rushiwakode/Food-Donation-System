import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
      const role = user.roles?.[0]?.replace('ROLE_', '').toLowerCase().replace('_', '-');
      const redirectTo = location.state?.from?.pathname || `/${role}/dashboard`;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-forest-800 dark:text-cream-50 mb-10">
            <span className="w-9 h-9 rounded-xl bg-forest-700 text-cream-50 flex items-center justify-center">
              <HeartIcon className="w-5 h-5" />
            </span>
            FoodShare
          </Link>

          <h1 className="font-display text-3xl font-semibold text-forest-900 dark:text-cream-50">Welcome back</h1>
          <p className="text-forest-500 dark:text-cream-300 mt-2 mb-8 text-sm">Sign in to continue rescuing food.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="label-field" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label-field !mb-0" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-tomato-600 hover:text-tomato-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-11 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center !py-3">
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-forest-500 dark:text-cream-300 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-forest-700 dark:text-forest-400 hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right: visual panel */}
      <div className="hidden lg:flex flex-1 bg-forest-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-tomato-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-forest-600/30 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 max-w-md text-cream-50"
        >
          <h2 className="font-display text-3xl font-semibold leading-tight">
            "We used to throw away 40 trays a week. Now they're claimed before closing."
          </h2>
          <p className="mt-4 text-cream-300/80 text-sm">— Sharma Restaurant, donor since 2024</p>
        </motion.div>
      </div>
    </div>
  );
}
