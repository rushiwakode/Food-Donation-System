import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  UserCircleIcon, CameraIcon, KeyIcon, ShieldCheckIcon,
  PhoneIcon, EnvelopeIcon, MapPinIcon, BuildingOfficeIcon,
  TruckIcon, StarIcon, CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { initials, formatDate } from '../../utils/formatters';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab]       = useState('profile');
  const fileInputRef                    = useRef(null);

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    watch,
    formState: { errors: pwdErrors },
  } = useForm();

  const newPasswordValue = watch('newPassword');

  useEffect(() => {
    userService.getCurrentUser()
      .then(setProfile)
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await userService.uploadProfileImage(file);
      const imageUrl = res?.imageUrl || res;
      updateUser({ profileImage: imageUrl });
      setProfile(prev => ({ ...prev, profileImage: imageUrl }));
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload image. Max size is 5MB.');
    } finally {
      setUploadingImage(false);
    }
  };

  const onChangePassword = async (data) => {
    setChangingPassword(true);
    try {
      await userService.changePassword(data.oldPassword, data.newPassword);
      toast.success('Password changed successfully!');
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password. Check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const roleLabel = {
    ROLE_ADMIN:          'System Administrator',
    ROLE_DONOR:          'Food Donor',
    ROLE_NGO:            'NGO Partner',
    ROLE_DELIVERY_AGENT: 'Delivery Agent',
  }[profile?.roles?.[0]] || 'User';

  const TABS = [
    { id: 'profile',  label: 'Profile',  icon: UserCircleIcon },
    { id: 'password', label: 'Password', icon: KeyIcon        },
  ];

  if (loading) return (
    <div className="max-w-3xl space-y-5">
      <div className="skeleton h-48 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm">
            <UserCircleIcon className="w-5 h-5 text-white" />
          </span>
          My Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your account details and security settings
        </p>
      </div>

      {/* ── PROFILE HERO CARD ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Gradient banner */}
        <div className="h-24 bg-gradient-to-r from-primary-500 via-primary-600 to-accent-600 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-xl font-bold shadow-lg overflow-hidden">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  initials(profile?.fullName)
                )}
              </div>
              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-md transition-colors"
                title="Change photo"
              >
                {uploadingImage
                  ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <CameraIcon className="w-3.5 h-3.5" />
                }
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
              <ShieldCheckIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">{roleLabel}</span>
            </div>
          </div>

          {/* Name & Email */}
          <div className="mb-5">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {profile?.fullName}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{profile?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {profile?.emailVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckBadgeIcon className="w-3.5 h-3.5" /> Email Verified
                </span>
              )}
              <span className={`badge ${profile?.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                {profile?.status}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Member since {formatDate(profile?.createdAt)}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            <InfoItem icon={PhoneIcon}          label="Phone"        value={profile?.phone} />
            <InfoItem icon={MapPinIcon}          label="City"         value={profile?.city} />
            <InfoItem icon={MapPinIcon}          label="State"        value={profile?.state} />
            <InfoItem icon={MapPinIcon}          label="Pincode"      value={profile?.pincode} />

            {/* Donor-specific */}
            {profile?.donorType && (
              <InfoItem icon={BuildingOfficeIcon} label="Donor Type"   value={profile.donorType} />
            )}
            {profile?.organization && (
              <InfoItem icon={BuildingOfficeIcon} label="Organization" value={profile.organization} />
            )}
            {profile?.totalDonated != null && (
              <InfoItem icon={StarIcon}           label="Total Donated" value={`${profile.totalDonated} donations`} />
            )}

            {/* NGO-specific */}
            {profile?.organizationName && (
              <InfoItem icon={BuildingOfficeIcon} label="NGO Name"     value={profile.organizationName} />
            )}
            {profile?.ngoVerified != null && (
              <InfoItem icon={CheckBadgeIcon}     label="NGO Verified" value={profile.ngoVerified ? 'Yes' : 'Pending'} />
            )}

            {/* Agent-specific */}
            {profile?.vehicleType && (
              <InfoItem icon={TruckIcon}          label="Vehicle"      value={profile.vehicleType} />
            )}
            {profile?.totalDeliveries != null && (
              <InfoItem icon={StarIcon}           label="Deliveries"   value={`${profile.totalDeliveries} completed`} />
            )}
          </div>
        </div>
      </motion.div>

      {/* ── TABS ────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            id={tab.id}                    // allows #password anchor from ProfileDropdown
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ─────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-5">
            Account Information
          </h3>
          <div className="space-y-4">
            <ReadOnlyField label="Full Name"  value={profile?.fullName} />
            <ReadOnlyField label="Email"      value={profile?.email} />
            <ReadOnlyField label="Phone"      value={profile?.phone} />
            <ReadOnlyField label="Address"    value={profile?.address} />
            <ReadOnlyField label="City"       value={profile?.city} />
            <ReadOnlyField label="State"      value={profile?.state} />
            <ReadOnlyField label="Role"       value={roleLabel} />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-5">
            To update your profile details, please contact the administrator.
          </p>
        </motion.div>
      )}

      {/* ── PASSWORD TAB ────────────────────────────────────── */}
      {activeTab === 'password' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-1">
            Change Password
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Choose a strong password with uppercase, lowercase, a number, and a symbol.
          </p>

          <form onSubmit={handlePwdSubmit(onChangePassword)} className="space-y-4" noValidate>
            <div>
              <label className="label-field">Current Password</label>
              <input
                type="password"
                className={`input-field ${pwdErrors.oldPassword ? 'input-error' : ''}`}
                placeholder="Enter your current password"
                {...registerPwd('oldPassword', { required: 'Current password is required' })}
              />
              {pwdErrors.oldPassword && (
                <p className="error-text">{pwdErrors.oldPassword.message}</p>
              )}
            </div>

            <div>
              <label className="label-field">New Password</label>
              <input
                type="password"
                className={`input-field ${pwdErrors.newPassword ? 'input-error' : ''}`}
                placeholder="Min. 8 characters"
                {...registerPwd('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: 'Must include uppercase, lowercase, number & symbol',
                  },
                })}
              />
              {pwdErrors.newPassword && (
                <p className="error-text">{pwdErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="label-field">Confirm New Password</label>
              <input
                type="password"
                className={`input-field ${pwdErrors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter new password"
                {...registerPwd('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: v => v === newPasswordValue || 'Passwords do not match',
                })}
              />
              {pwdErrors.confirmPassword && (
                <p className="error-text">{pwdErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="btn-primary w-full justify-center !py-3 mt-2"
            >
              {changingPassword ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <KeyIcon className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="label-field">{label}</label>
      <div className="input-field bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 cursor-not-allowed">
        {value || <span className="text-slate-400">—</span>}
      </div>
    </div>
  );
}