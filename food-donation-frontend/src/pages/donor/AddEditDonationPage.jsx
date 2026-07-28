import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import donationService from '../../services/donationService';
import categoryService from '../../services/categoryService';
import { FOOD_TYPES, QUANTITY_UNITS } from '../../utils/constants';

export default function AddEditDonationPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit) {
      donationService.getDonation(id).then((d) => {
        reset({
          title: d.title,
          description: d.description,
          foodType: d.foodType,
          quantity: d.quantity,
          quantityUnit: d.quantityUnit,
          categoryId: d.categoryId,
          preparedAt: toLocalInput(d.preparedAt),
          expiresAt: toLocalInput(d.expiresAt),
          pickupAddress: d.pickupAddress,
          pickupCity: d.pickupCity,
          pickupState: d.pickupState,
          pickupPincode: d.pickupPincode,
          pickupInstructions: d.pickupInstructions,
          allergenInfo: d.allergenInfo,
          specialNotes: d.specialNotes,
        });
      }).finally(() => setLoading(false));
    } else {
      reset({ quantityUnit: 'SERVINGS', foodType: 'VEG', isPerishable: true });
    }
  }, [id, isEdit, reset]);

  const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - images.length);
    setImages((prev) => [...prev, ...files].slice(0, 5));
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews].slice(0, 5));
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        quantity: Number(data.quantity),
        categoryId: Number(data.categoryId),
        isPerishable: true,
      };

      let donationId = id;
      if (isEdit) {
        await donationService.updateDonation(id, payload);
        toast.success('Donation updated successfully');
      } else {
        const created = await donationService.createDonation(payload);
        donationId = created.id;
        toast.success('Donation created! It will be reviewed by an admin shortly.');
      }

      if (images.length > 0 && donationId) {
        await donationService.uploadImages(donationId, images);
      }

      navigate('/donor/donations');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save donation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="skeleton h-96 w-full rounded-2xl" />;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mb-1">
        {isEdit ? 'Edit Donation' : 'List a New Donation'}
      </h1>
      <p className="text-forest-500 dark:text-cream-300 text-sm mb-6">
        Provide accurate details so NGOs can quickly decide whether this fits their needs.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8 space-y-6" noValidate>
        <div>
          <label className="label-field">Title</label>
          <input className={`input-field ${errors.title ? 'input-error' : ''}`}
            placeholder="e.g. Veg Thali Trays (40 servings)"
            {...register('title', { required: 'Title is required', maxLength: { value: 200, message: 'Too long' } })} />
          {errors.title && <p className="error-text">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label-field">Description</label>
          <textarea rows={3} className="input-field" placeholder="Describe what's included, freshness, packaging, etc."
            {...register('description')} />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label-field">Food Type</label>
            <select className="input-field" {...register('foodType', { required: true })}>
              {FOOD_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', '-')}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Quantity</label>
            <input type="number" min="1" className={`input-field ${errors.quantity ? 'input-error' : ''}`}
              {...register('quantity', { required: 'Required', min: { value: 1, message: 'Must be at least 1' } })} />
            {errors.quantity && <p className="error-text">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="label-field">Unit</label>
            <select className="input-field" {...register('quantityUnit')}>
              {QUANTITY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label-field">Category</label>
          <select className={`input-field ${errors.categoryId ? 'input-error' : ''}`}
            {...register('categoryId', { required: 'Category is required' })}>
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <p className="error-text">{errors.categoryId.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Prepared At</label>
            <input type="datetime-local" className={`input-field ${errors.preparedAt ? 'input-error' : ''}`}
              {...register('preparedAt', { required: 'Required' })} />
            {errors.preparedAt && <p className="error-text">{errors.preparedAt.message}</p>}
          </div>
          <div>
            <label className="label-field">Expires At</label>
            <input type="datetime-local" className={`input-field ${errors.expiresAt ? 'input-error' : ''}`}
              {...register('expiresAt', { required: 'Required' })} />
            {errors.expiresAt && <p className="error-text">{errors.expiresAt.message}</p>}
          </div>
        </div>

        <div className="border-t border-forest-900/8 dark:border-cream-100/8 pt-6">
          <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50 mb-4">Pickup Details</h3>
          <div className="space-y-4">
            <div>
              <label className="label-field">Pickup Address</label>
              <input className={`input-field ${errors.pickupAddress ? 'input-error' : ''}`}
                {...register('pickupAddress', { required: 'Required' })} />
              {errors.pickupAddress && <p className="error-text">{errors.pickupAddress.message}</p>}
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label-field">City</label>
                <input className={`input-field ${errors.pickupCity ? 'input-error' : ''}`}
                  {...register('pickupCity', { required: 'Required' })} />
                {errors.pickupCity && <p className="error-text">{errors.pickupCity.message}</p>}
              </div>
              <div>
                <label className="label-field">State</label>
                <input className="input-field" {...register('pickupState')} />
              </div>
              <div>
                <label className="label-field">Pincode</label>
                <input className="input-field" {...register('pickupPincode')} />
              </div>
            </div>
            <div>
              <label className="label-field">Pickup Instructions (optional)</label>
              <input className="input-field" placeholder="e.g. Use the back entrance, ask for Raj"
                {...register('pickupInstructions')} />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Allergen Info (optional)</label>
            <input className="input-field" placeholder="Contains nuts, dairy…" {...register('allergenInfo')} />
          </div>
          <div>
            <label className="label-field">Special Notes (optional)</label>
            <input className="input-field" {...register('specialNotes')} />
          </div>
        </div>

        <div>
          <label className="label-field">Photos (up to 5)</label>
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-forest-950/70 text-white flex items-center justify-center">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-forest-300 dark:border-forest-700 flex flex-col items-center justify-center cursor-pointer hover:border-forest-500 transition-colors">
                <PhotoIcon className="w-6 h-6 text-forest-400" />
                <span className="text-xs text-forest-400 mt-1">Add photo</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
            {submitting ? 'Saving…' : isEdit ? 'Update Donation' : 'Create Donation'}
          </button>
        </div>
      </form>
    </div>
  );
}
