import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import contactService from '../../services/contactService';

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await contactService.submitMessage(data);
      toast.success("Message sent! We'll get back to you soon.");
      reset();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-container py-16">
      <div className="text-center mb-12 max-w-xl mx-auto">
        <h1 className="font-display text-4xl font-semibold text-forest-900 dark:text-cream-50">Get in Touch</h1>
        <p className="text-forest-500 dark:text-cream-300 mt-2">Questions, partnership ideas, or just want to say hi — we'd love to hear from you.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
          <ContactInfo icon={EnvelopeIcon} label="Email" value="admin@fooddonation.com" />
          <ContactInfo icon={PhoneIcon} label="Phone" value="+91 99999 99999" />
          <ContactInfo icon={MapPinIcon} label="Office" value="Koregaon Park, Pune, Maharashtra, India" />
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-3 glass-card bg-white dark:bg-forest-900 p-6 sm:p-8 space-y-4"
          noValidate
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Name</label>
              <input className={`input-field ${errors.name ? 'input-error' : ''}`} {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label-field">Email</label>
              <input type="email" className={`input-field ${errors.email ? 'input-error' : ''}`} {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
          </div>
          <div>
            <label className="label-field">Phone (optional)</label>
            <input className="input-field" {...register('phone')} />
          </div>
          <div>
            <label className="label-field">Subject</label>
            <input className={`input-field ${errors.subject ? 'input-error' : ''}`} {...register('subject', { required: 'Subject is required' })} />
            {errors.subject && <p className="error-text">{errors.subject.message}</p>}
          </div>
          <div>
            <label className="label-field">Message</label>
            <textarea rows={4} className={`input-field ${errors.message ? 'input-error' : ''}`} {...register('message', { required: 'Message is required' })} />
            {errors.message && <p className="error-text">{errors.message.message}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center !py-3">
            {submitting ? 'Sending…' : 'Send Message'}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl bg-forest-50 dark:bg-forest-800 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-forest-600 dark:text-forest-400" />
      </div>
      <div>
        <p className="text-xs text-forest-500 dark:text-cream-400 uppercase tracking-wide font-semibold">{label}</p>
        <p className="text-forest-800 dark:text-cream-100 font-medium">{value}</p>
      </div>
    </div>
  );
}
