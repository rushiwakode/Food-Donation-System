import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon, CameraIcon, KeyIcon, PencilIcon,
  CheckIcon, XMarkIcon, ShieldCheckIcon, ClockIcon,
  EnvelopeIcon, PhoneIcon, MapPinIcon, BuildingOfficeIcon,
  ExclamationTriangleIcon, CheckBadgeIcon, ArrowPathIcon,
  LockClosedIcon, InformationCircleIcon, PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import userService    from '../../services/userService';
import profileService from '../../services/profileService';
import { useAuth }    from '../../contexts/AuthContext';
import { initials, formatDate, formatDateTime } from '../../utils/formatters';

/* ─── Status metadata ──────────────────────────────────────── */
const STATUS_META = {
  PENDING:   { color: 'badge-warning', label: 'Pending Review',   icon: ClockIcon,              info: 'Waiting for admin to review your request.' },
  APPROVED:  { color: 'badge-info',    label: 'Approved ✅',       icon: CheckIcon,              info: 'Admin approved! Click "Send OTP" to receive your verification code.' },
  REJECTED:  { color: 'badge-danger',  label: 'Rejected',         icon: XMarkIcon,              info: 'Your request was rejected. See admin note below.' },
  OTP_SENT:  { color: 'badge-purple',  label: 'OTP Sent',         icon: EnvelopeIcon,           info: 'OTP sent! Enter it below to complete the change. Valid for 10 minutes.' },
  COMPLETED: { color: 'badge-success', label: 'Completed',        icon: CheckBadgeIcon,         info: 'Change applied successfully.' },
  EXPIRED:   { color: 'badge-neutral', label: 'Expired',          icon: ExclamationTriangleIcon,info: 'OTP expired. You can resend it.' },
};

const TABS = [
  { id: 'profile',  label: 'My Profile',        icon: UserCircleIcon  },
  { id: 'edit',     label: 'Edit Info',          icon: PencilIcon      },
  { id: 'contact',  label: 'Change Email/Phone', icon: EnvelopeIcon    },
  { id: 'requests', label: 'My Requests',        icon: ClockIcon       },
  { id: 'password', label: 'Password',           icon: KeyIcon         },
];

export default function ProfilePage() {
  const { user, updateUser }  = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab]   = useState('profile');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  /* OTP state */
  const [activeOtpRequest, setActiveOtpRequest] = useState(null); // APPROVED or OTP_SENT request
  const [sendingOtp,   setSendingOtp]   = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  /* Other loading states */
  const [savingBasic,   setSavingBasic]   = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingPwd,     setSavingPwd]     = useState(false);

  const fileInputRef = useRef(null);

  /* Forms */
  const { register: regBasic, handleSubmit: submitBasic, reset: resetBasic,
          formState: { errors: basicErrors, isDirty: basicDirty } } = useForm();

  const { register: regContact, handleSubmit: submitContact, reset: resetContact,
          watch: watchContact, formState: { errors: contactErrors } } = useForm(
            { defaultValues: { fieldType: 'EMAIL' } }
          );

  const { register: regPwd, handleSubmit: submitPwd, reset: resetPwd,
          watch: watchPwd, formState: { errors: pwdErrors } } = useForm();

  const { register: regOtp, handleSubmit: submitOtpForm, reset: resetOtp,
          formState: { errors: otpErrors } } = useForm();

  const newPwdVal = watchPwd('newPassword');

  /* ── Load profile ─────────────────────────────────────── */
  useEffect(() => {
    userService.getCurrentUser()
      .then(p => {
        setProfile(p);
        resetBasic({
          fullName: p.fullName || '',
          address:  p.address  || '',
          city:     p.city     || '',
          state:    p.state    || '',
          pincode:  p.pincode  || '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Load my requests when tab opens ─────────────────── */
  useEffect(() => {
    if (activeTab === 'requests') fetchMyRequests();
  }, [activeTab]);

  const fetchMyRequests = async () => {
    setRequestsLoading(true);
    try {
      const result = await profileService.getMyChangeRequests({ page: 0, size: 20 });
      const reqs   = result.content || [];
      setMyRequests(reqs);

      // Find an actionable request — APPROVED (needs Send OTP) or OTP_SENT (needs verify)
      const actionable = reqs.find(r =>
        r.status === 'APPROVED' || r.status === 'OTP_SENT'
      );
      setActiveOtpRequest(actionable || null);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  /* ── Profile image ────────────────────────────────────── */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await userService.uploadProfileImage(file);
      const url = res?.imageUrl || res;
      updateUser({ profileImage: url });
      setProfile(p => ({ ...p, profileImage: url }));
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload. Max 5MB, images only.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  /* ── Save basic profile ───────────────────────────────── */
  const onSaveBasic = async (data) => {
    setSavingBasic(true);
    try {
      const updated = await profileService.updateBasicProfile(data);
      setProfile(p => ({ ...p, ...updated }));
      updateUser({ fullName: updated.fullName });
      toast.success('Profile updated!');
      resetBasic(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingBasic(false);
    }
  };

  /* ── Submit contact change request ───────────────────── */
  const onSubmitContactRequest = async (data) => {
    setSavingContact(true);
    try {
      await profileService.submitContactChangeRequest({
        fieldType: data.fieldType,
        newValue:  data.newValue.trim(),
        reason:    data.reason.trim(),
      });
      toast.success('Request submitted! Admin will review it and notify you.');
      resetContact({ fieldType: 'EMAIL' });
      setActiveTab('requests');
      fetchMyRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSavingContact(false);
    }
  };

  /* ── SEND OTP — only when user explicitly clicks ─────── */
  const onSendOtp = async (requestId) => {
    setSendingOtp(true);
    try {
      await profileService.sendOtp(requestId);
      toast.success('OTP sent! Check your new email/phone.');
      fetchMyRequests(); // refresh to get OTP_SENT status
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  /* ── RESEND OTP ───────────────────────────────────────── */
  const onResendOtp = async (requestId) => {
    setResendingOtp(true);
    try {
      await profileService.sendOtp(requestId);
      toast.success('OTP resent! Check your new email/phone.');
      fetchMyRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Please wait 60 seconds before resending.');
    } finally {
      setResendingOtp(false);
    }
  };

  /* ── VERIFY OTP ───────────────────────────────────────── */
  const onVerifyOtp = async (data) => {
    if (!activeOtpRequest) return;
    setVerifyingOtp(true);
    try {
      const updated = await profileService.verifyOtp({
        requestId: activeOtpRequest.id,
        otp:       data.otp.trim(),
      });
      setProfile(p => ({ ...p, ...updated }));
      updateUser({ email: updated.email });
      toast.success('✅ ' + activeOtpRequest.fieldType + ' updated successfully!');
      setActiveOtpRequest(null);
      resetOtp();
      fetchMyRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  /* ── Change password ──────────────────────────────────── */
  const onChangePassword = async (data) => {
    setSavingPwd(true);
    try {
      await userService.changePassword(data.oldPassword, data.newPassword);
      toast.success('Password changed successfully!');
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Wrong current password');
    } finally {
      setSavingPwd(false);
    }
  };

  const roleLabel = {
    ROLE_ADMIN:          'System Administrator',
    ROLE_DONOR:          'Food Donor',
    ROLE_NGO:            'NGO Partner',
    ROLE_DELIVERY_AGENT: 'Delivery Agent',
  }[profile?.roles?.[0]] || 'User';

  if (loading) return (
    <div className="max-w-3xl space-y-4">
      <div className="skeleton h-48 rounded-2xl" />
      <div className="skeleton h-10 rounded-xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">

      {/* ── APPROVED BANNER — shows when request approved & OTP not yet sent ── */}
      <AnimatePresence>
        {activeOtpRequest?.status === 'APPROVED' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border-2 border-primary-400 bg-primary-50 dark:bg-primary-900/20 p-4 flex items-start gap-3"
          >
            <CheckBadgeIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-primary-800 dark:text-primary-300 text-sm">
                Your {activeOtpRequest.fieldType} change request was approved!
              </p>
              <p className="text-primary-700 dark:text-primary-400 text-xs mt-0.5">
                New {activeOtpRequest.fieldType.toLowerCase()}: <strong>{activeOtpRequest.requestedValue}</strong>
              </p>
              <p className="text-primary-600 dark:text-primary-500 text-xs mt-1">
                Click the button below to receive your OTP when you're ready.
              </p>
              <button
                onClick={() => setActiveTab('requests')}
                className="text-xs font-semibold text-primary-700 dark:text-primary-400 underline mt-1.5"
              >
                Go to My Requests to send OTP →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── OTP SENT BANNER — shows when OTP already sent ── */}
      <AnimatePresence>
        {activeOtpRequest?.status === 'OTP_SENT' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border-2 border-accent-400 bg-accent-50 dark:bg-accent-900/20 p-4 flex items-start gap-3"
          >
            <LockClosedIcon className="w-6 h-6 text-accent-600 dark:text-accent-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-accent-800 dark:text-accent-300 text-sm">
                OTP sent to: <strong>{activeOtpRequest.requestedValue}</strong>
              </p>
              <p className="text-accent-700 dark:text-accent-400 text-xs mt-0.5">
                Enter the 6-digit code in My Requests tab. Valid for 10 minutes.
              </p>
              <button
                onClick={() => setActiveTab('requests')}
                className="text-xs font-semibold text-accent-700 dark:text-accent-400 underline mt-1"
              >
                Verify OTP →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PROFILE HERO ──────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary-500 via-primary-600 to-accent-600 relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        </div>
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-xl font-bold shadow-lg overflow-hidden">
                {profile?.profileImage
                  ? <img src={profile.profileImage} alt={profile.fullName} className="w-full h-full object-cover" />
                  : initials(profile?.fullName)}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-md transition-colors"
              >
                {uploadingImage
                  ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <CameraIcon className="w-3.5 h-3.5" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
              <ShieldCheckIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">{roleLabel}</span>
            </div>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{profile?.fullName}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{profile?.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {profile?.emailVerified && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckBadgeIcon className="w-3.5 h-3.5" /> Email Verified
              </span>
            )}
            <span className={`badge ${profile?.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
              {profile?.status}
            </span>
            <span className="text-xs text-slate-400">Member since {formatDate(profile?.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          TAB: MY PROFILE (view only)
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 space-y-4">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-2">Account Information</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <ViewField icon={UserCircleIcon}    label="Full Name"    value={profile?.fullName} />
            <ViewField icon={EnvelopeIcon}      label="Email"        value={profile?.email} />
            <ViewField icon={PhoneIcon}         label="Phone"        value={profile?.phone} />
            <ViewField icon={MapPinIcon}        label="City"         value={profile?.city} />
            <ViewField icon={MapPinIcon}        label="State"        value={profile?.state} />
            <ViewField icon={MapPinIcon}        label="Pincode"      value={profile?.pincode} />
            {profile?.address && (
              <div className="sm:col-span-2">
                <ViewField icon={BuildingOfficeIcon} label="Address" value={profile.address} />
              </div>
            )}
            {profile?.organizationName && <ViewField icon={BuildingOfficeIcon} label="Organization" value={profile.organizationName} />}
            {profile?.vehicleType && <ViewField icon={BuildingOfficeIcon} label="Vehicle" value={profile.vehicleType} />}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={() => setActiveTab('edit')} className="btn-primary !py-2 text-sm">
              <PencilIcon className="w-4 h-4" /> Edit Basic Info
            </button>
            <button onClick={() => setActiveTab('contact')} className="btn-secondary !py-2 text-sm">
              <EnvelopeIcon className="w-4 h-4" /> Change Email / Phone
            </button>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: EDIT BASIC INFO
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'edit' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-1">Edit Basic Information</h3>
          <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400">These fields update instantly — no approval required.</p>
          </div>
          <form onSubmit={submitBasic(onSaveBasic)} className="space-y-4" noValidate>
            <div>
              <label className="label-field">Full Name</label>
              <input className={`input-field ${basicErrors.fullName ? 'input-error' : ''}`}
                placeholder="Your full name"
                {...regBasic('fullName', {
                  minLength: { value: 2, message: 'At least 2 characters' },
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })} />
              {basicErrors.fullName && <p className="error-text">{basicErrors.fullName.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">City</label>
                <input className="input-field" placeholder="e.g. Pune" {...regBasic('city')} />
              </div>
              <div>
                <label className="label-field">State</label>
                <input className="input-field" placeholder="e.g. Maharashtra" {...regBasic('state')} />
              </div>
            </div>
            <div>
              <label className="label-field">Pincode</label>
              <input className="input-field" placeholder="e.g. 411001" maxLength={10} {...regBasic('pincode')} />
            </div>
            <div>
              <label className="label-field">Address</label>
              <textarea rows={3} className={`input-field ${basicErrors.address ? 'input-error' : ''}`}
                placeholder="Street address, area..."
                {...regBasic('address', { maxLength: { value: 500, message: 'Max 500 characters' } })} />
              {basicErrors.address && <p className="error-text">{basicErrors.address.message}</p>}
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={savingBasic || !basicDirty} className="btn-primary">
                {savingBasic
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                  : <><CheckIcon className="w-4 h-4" /> Save Changes</>}
              </button>
              <button type="button" onClick={() => setActiveTab('profile')} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: CHANGE EMAIL / PHONE
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'contact' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
            <InformationCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-semibold mb-1">How the process works</p>
              <ol className="list-decimal ml-4 space-y-1 text-xs">
                <li>Submit your request with the new email/phone and reason below.</li>
                <li>Admin reviews and approves or rejects within 24 hours.</li>
                <li>You get a notification when approved.</li>
                <li className="font-semibold text-amber-700 dark:text-amber-300">
                  Go to "My Requests" tab and click <strong>"Send OTP"</strong> when ready.
                </li>
                <li>OTP is sent to your <strong>new</strong> email/phone — enter it to complete the change.</li>
              </ol>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-5">Request Contact Change</h3>
            <form onSubmit={submitContact(onSubmitContactRequest)} className="space-y-4" noValidate>
              <div>
                <label className="label-field">What do you want to change?</label>
                <div className="grid grid-cols-2 gap-3">
                  {['EMAIL', 'PHONE'].map(type => (
                    <label key={type} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      watchContact('fieldType') === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                    }`}>
                      <input type="radio" value={type} className="sr-only" {...regContact('fieldType')} />
                      {type === 'EMAIL'
                        ? <EnvelopeIcon className="w-5 h-5 text-primary-500 shrink-0" />
                        : <PhoneIcon    className="w-5 h-5 text-primary-500 shrink-0" />}
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {type === 'EMAIL' ? 'Email Address' : 'Phone Number'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {type === 'EMAIL' ? profile?.email : (profile?.phone || 'Not set')}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-field">
                  New {watchContact('fieldType') === 'EMAIL' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  className={`input-field ${contactErrors.newValue ? 'input-error' : ''}`}
                  placeholder={watchContact('fieldType') === 'EMAIL' ? 'newemail@example.com' : '9876543210'}
                  type={watchContact('fieldType') === 'EMAIL' ? 'email' : 'tel'}
                  {...regContact('newValue', {
                    required: 'New value is required',
                    validate: (v) => {
                      if (watchContact('fieldType') === 'EMAIL')
                        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email format';
                      return /^[6-9]\d{9}$/.test(v) || 'Enter a valid 10-digit phone number';
                    },
                  })}
                />
                {contactErrors.newValue && <p className="error-text">{contactErrors.newValue.message}</p>}
              </div>

              <div>
                <label className="label-field">Reason for Change</label>
                <textarea rows={3}
                  className={`input-field ${contactErrors.reason ? 'input-error' : ''}`}
                  placeholder="Explain why you need to change this (min 10 characters)..."
                  {...regContact('reason', {
                    required:  'Please provide a reason',
                    minLength: { value: 10,   message: 'Reason must be at least 10 characters' },
                    maxLength: { value: 1000, message: 'Reason is too long' },
                  })} />
                {contactErrors.reason && <p className="error-text">{contactErrors.reason.message}</p>}
              </div>

              <button type="submit" disabled={savingContact} className="btn-primary w-full justify-center !py-3">
                {savingContact
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</>
                  : <><PaperAirplaneIcon className="w-4 h-4" /> Submit Change Request</>}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: MY REQUESTS
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'requests' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

          {/* ── OTP VERIFY BOX — only shown when status = OTP_SENT ── */}
          <AnimatePresence>
            {activeOtpRequest?.status === 'OTP_SENT' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="card p-6 border-2 border-accent-400 dark:border-accent-600"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                    <LockClosedIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-slate-900 dark:text-white">
                      Verify Your New {activeOtpRequest.fieldType}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      OTP sent to: <strong className="text-accent-600 dark:text-accent-400">{activeOtpRequest.requestedValue}</strong>
                    </p>
                  </div>
                </div>

                <form onSubmit={submitOtpForm(onVerifyOtp)} className="space-y-3">
                  <div>
                    <label className="label-field">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className={`input-field text-center font-mono text-2xl tracking-[0.4em] ${otpErrors.otp ? 'input-error' : ''}`}
                      placeholder="• • • • • •"
                      {...regOtp('otp', {
                        required: 'OTP is required',
                        pattern:  { value: /^\d{6}$/, message: 'OTP must be exactly 6 digits' },
                      })}
                    />
                    {otpErrors.otp && <p className="error-text">{otpErrors.otp.message}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={verifyingOtp} className="btn-primary flex-1 justify-center">
                      {verifyingOtp
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying…</>
                        : <><CheckIcon className="w-4 h-4" /> Verify OTP</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => onResendOtp(activeOtpRequest.id)}
                      disabled={resendingOtp}
                      className="btn-secondary"
                    >
                      {resendingOtp
                        ? <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        : <ArrowPathIcon className="w-4 h-4" />}
                      Resend
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── REQUESTS LIST ─────────────────────────────────── */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-slate-900 dark:text-white">Change Requests History</h3>
              <button onClick={fetchMyRequests} className="btn-icon" title="Refresh">
                <ArrowPathIcon className={`w-4 h-4 ${requestsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {requestsLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 w-full" />)}</div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-10">
                <ClockIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">No change requests yet.</p>
                <button onClick={() => setActiveTab('contact')} className="btn-outline mt-3 text-sm !py-2">
                  Submit a Request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map(req => {
                  const meta = STATUS_META[req.status] || STATUS_META.PENDING;
                  const StatusIcon = meta.icon;
                  const isApproved = req.status === 'APPROVED';
                  const isOtpSent  = req.status === 'OTP_SENT';

                  return (
                    <div key={req.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isApproved ? 'border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10' :
                        isOtpSent  ? 'border-accent-300 dark:border-accent-700 bg-accent-50/50 dark:bg-accent-900/10' :
                                     'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          {req.fieldType === 'EMAIL'
                            ? <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                            : <PhoneIcon    className="w-4 h-4 text-slate-400" />}
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {req.fieldType} Change Request
                          </span>
                        </div>
                        <span className={`badge ${meta.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </div>

                      {/* Status info message */}
                      <p className={`text-xs mt-2 font-medium ${
                        isApproved ? 'text-primary-700 dark:text-primary-400' :
                        isOtpSent  ? 'text-accent-700 dark:text-accent-400' :
                                     'text-slate-500 dark:text-slate-400'
                      }`}>
                        {meta.info}
                      </p>

                      <div className="mt-2 grid sm:grid-cols-2 gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <div><span className="font-medium text-slate-600 dark:text-slate-300">Current: </span>{req.currentValue}</div>
                        <div>
                          <span className="font-medium text-slate-600 dark:text-slate-300">Requested: </span>
                          <span className="text-primary-600 dark:text-primary-400 font-medium">{req.requestedValue}</span>
                        </div>
                      </div>

                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium">Reason: </span>{req.reason}
                      </p>

                      {req.adminNote && (
                        <div className={`mt-2 p-2 rounded-lg text-xs ${
                          req.status === 'REJECTED'
                            ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400'
                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          <span className="font-semibold">Admin note: </span>{req.adminNote}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <p className="text-xs text-slate-400">{formatDateTime(req.createdAt)}</p>

                        {/* ── SEND OTP BUTTON — only for APPROVED status ── */}
                        {isApproved && (
                          <button
                            onClick={() => onSendOtp(req.id)}
                            disabled={sendingOtp}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                                       bg-gradient-to-r from-primary-500 to-primary-600 text-white
                                       shadow-glow-sm hover:shadow-glow-md transition-all active:scale-95 disabled:opacity-60"
                          >
                            {sendingOtp
                              ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              : <PaperAirplaneIcon className="w-3.5 h-3.5" />}
                            Send OTP to {req.requestedValue}
                          </button>
                        )}

                        {/* ── ENTER OTP BUTTON — only for OTP_SENT status ── */}
                        {isOtpSent && (
                          <button
                            onClick={() => {
                              setActiveOtpRequest(req);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                                       bg-gradient-to-r from-accent-500 to-accent-600 text-white
                                       shadow-md hover:shadow-lg transition-all active:scale-95"
                          >
                            <LockClosedIcon className="w-3.5 h-3.5" />
                            Enter OTP ↑
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: CHANGE PASSWORD
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'password' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-1">Change Password</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Use uppercase, lowercase, a number, and a special character.
          </p>
          <form onSubmit={submitPwd(onChangePassword)} className="space-y-4" noValidate>
            <div>
              <label className="label-field">Current Password</label>
              <input type="password" className={`input-field ${pwdErrors.oldPassword ? 'input-error' : ''}`}
                placeholder="Enter current password"
                {...regPwd('oldPassword', { required: 'Current password is required' })} />
              {pwdErrors.oldPassword && <p className="error-text">{pwdErrors.oldPassword.message}</p>}
            </div>
            <div>
              <label className="label-field">New Password</label>
              <input type="password" className={`input-field ${pwdErrors.newPassword ? 'input-error' : ''}`}
                placeholder="Min. 8 characters"
                {...regPwd('newPassword', {
                  required:  'New password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                  pattern: {
                    value:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: 'Must include uppercase, lowercase, number & symbol',
                  },
                })} />
              {pwdErrors.newPassword && <p className="error-text">{pwdErrors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label-field">Confirm New Password</label>
              <input type="password" className={`input-field ${pwdErrors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter new password"
                {...regPwd('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: v => v === newPwdVal || 'Passwords do not match',
                })} />
              {pwdErrors.confirmPassword && <p className="error-text">{pwdErrors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={savingPwd} className="btn-primary w-full justify-center !py-3">
              {savingPwd
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating…</>
                : <><KeyIcon className="w-4 h-4" /> Update Password</>}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}

function ViewField({ icon: Icon, label, value }) {
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