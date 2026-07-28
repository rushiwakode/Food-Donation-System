import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { TagIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import EmptyState from '../../components/common/EmptyState';
import apiClient from '../../services/apiClient';
import categoryService from '../../services/categoryService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });

  const fetchCategories = () => {
    setLoading(true);
    categoryService.getAllCategories().then(setCategories).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditing('new'); setForm({ name: '', description: '', icon: '' }); };
  const openEdit = (c) => { setEditing(c.id); setForm({ name: c.name, description: c.description || '', icon: c.icon || '' }); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      if (editing === 'new') {
        await apiClient.post('/categories/admin', form);
        toast.success('Category created');
      } else {
        await apiClient.put(`/categories/admin/${editing}`, form);
        toast.success('Category updated');
      }
      setEditing(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/categories/admin/${id}`);
      toast.success('Category deactivated');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to deactivate category');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50">Food Categories</h1>
        <button onClick={openCreate} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Category</button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : categories.length === 0 ? (
        <EmptyState icon={TagIcon} title="No categories yet" description="Add your first food category." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="card p-5 flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50">{c.name}</h3>
                {c.description && <p className="text-sm text-forest-500 dark:text-cream-300 mt-1">{c.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(c)} className="btn-icon !w-8 !h-8"><PencilIcon className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(c.id)} className="btn-icon !w-8 !h-8 text-tomato-600"><TrashIcon className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/50 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="glass-card bg-white dark:bg-forest-900 p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-semibold mb-4">{editing === 'new' ? 'New Category' : 'Edit Category'}</h3>
            <div className="space-y-3">
              <div>
                <label className="label-field">Name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label-field">Description</label>
                <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
