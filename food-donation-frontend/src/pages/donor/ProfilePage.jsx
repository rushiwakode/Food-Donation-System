import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { CameraIcon } from '@heroicons/react/24/outline';
import userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { initials } from '../../utils/formatters';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, formState: { errors: pwdErrors } } = useForm();

  useEffect(() => {
    userService.getCurrentUser().then(setProfile).finally(() => setLoading(false));
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { imageUrl } = await userService.uploadProfileImage(file);
      updateUser({ profileImage: imageUrl });
      setProfile((p) => ({ ...p, profileImage: imageUrl }));
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const onChangePassword = async (data) => {
    setChangingPassword(true);
    try {
      await userService.changePassword(data.oldPassword, data.newPassword);
      toast.success('Password changed successfully');
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="skeleton h-96 w-full rounded-2xl" />;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">My Profile</h1>

      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-forest-700 text-cream-50 flex items-center justify-center text-xl font-semibold overflow-hidden">
              {profile?.profileImage ? (
                <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
              ) : initials(profile?.fullName)}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-forest-600 text-white flex items-center justify-center cursor-pointer border-2 border-white dark:border-forest-900">
              <CameraIcon className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploadingImage} />
            </label>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-forest-900 dark:text-cream-50">{profile?.fullName}</h2>
            <p className="text-sm text-forest-500 dark:text-cream-300">{profile?.email}</p>
            <div className="flex gap-1.5 mt-1.5">
              {profile?.roles?.map((r) => (
                <span key={r} className="badge badge-info">{r.replace('ROLE_', '')}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-forest-900/8 dark:border-cream-100/8">
          <InfoField label="Phone" value={profile?.phone} />
          <InfoField label="City" value={profile?.city} />
          <InfoField label="State" value={profile?.state} />
          <InfoField label="Status" value={profile?.status} />
          {profile?.organization && <InfoField label="Organization" value={profile.organization} />}
          {profile?.organizationName && <InfoField label="NGO Name" value={profile.organizationName} />}
          {profile?.vehicleType && <InfoField label="Vehicle" value={profile.vehicleType} />}
          {profile?.totalDonated != null && <InfoField label="Total Donated" value={profile.totalDonated} />}
          {profile?.totalDeliveries != null && <InfoField label="Total Deliveries" value={profile.totalDeliveries} />}
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <h3 className="font-display text-lg font-semibold text-forest-900 dark:text-cream-50 mb-4">Change Password</h3>
        <form onSubmit={handlePwdSubmit(onChangePassword)} className="space-y-4" noValidate>
          <div>
            <label className="label-field">Current Password</label>
            <input type="password" className={`input-field ${pwdErrors.oldPassword ? 'input-error' : ''}`}
              {...registerPwd('oldPassword', { required: 'Required' })} />
            {pwdErrors.oldPassword && <p className="error-text">{pwdErrors.oldPassword.message}</p>}
          </div>
          <div>
            <label className="label-field">New Password</label>
            <input type="password" className={`input-field ${pwdErrors.newPassword ? 'input-error' : ''}`}
              {...registerPwd('newPassword', {
                required: 'Required',
                pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, message: 'Must include uppercase, lowercase, number & symbol' },
              })} />
            {pwdErrors.newPassword && <p className="error-text">{pwdErrors.newPassword.message}</p>}
          </div>
          <button type="submit" disabled={changingPassword} className="btn-primary">
            {changingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-forest-500 dark:text-cream-400 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-forest-800 dark:text-cream-100 font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}
