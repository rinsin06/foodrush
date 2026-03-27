import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon, PlusIcon, PencilIcon,
  TrashIcon, XMarkIcon, PhotoIcon
} from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice.js';
import axiosInstance from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters.js';

const EMPTY_ITEM = {
  name: '', description: '', price: '', discountedPrice: '',
  imageUrl: '', isVeg: true, isAvailable: true, isBestseller: false,
  calories: '', preparationTimeMinutes: 15, categoryId: '',
};

export default function ManageMenu() {
  const user                        = useSelector(selectUser);
  const [restaurants, setRestaurants] = useState([]);
  const [activeRestaurant, setActive] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showModal, setModal]       = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(EMPTY_ITEM);
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);

  // Load owner's restaurants
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/api/v1/restaurants/my');
        setRestaurants(data);
        if (data.length > 0) setActive(data[0]);
      } catch { toast.error('Failed to load your restaurants'); }
      finally  { setLoading(false); }
    })();
  }, []);

  // Load menu when restaurant changes
  useEffect(() => {
    if (!activeRestaurant) return;
    (async () => {
      try {
        const { data } = await axiosInstance.get(`/api/v1/restaurants/${activeRestaurant.id}/menu`);
        setCategories(data);
      } catch { toast.error('Failed to load menu'); }
    })();
  }, [activeRestaurant]);

  function openCreate() { setEditItem(null); setForm(EMPTY_ITEM); setModal(true); }
  function openEdit(item) { setEditItem(item); setForm({ ...item, categoryId: item.categoryId || '' }); setModal(true); }

  async function handleSave() {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    try {
      setSaving(true);
      const payload = { ...form, price: parseFloat(form.price), discountedPrice: form.discountedPrice ? parseFloat(form.discountedPrice) : null, calories: form.calories ? parseInt(form.calories) : null, categoryId: form.categoryId || null };

      if (editItem) {
        await axiosInstance.put(`/api/v1/restaurants/${activeRestaurant.id}/menu/items/${editItem.id}`, payload);
        toast.success('Item updated');
      } else {
        await axiosInstance.post(`/api/v1/restaurants/${activeRestaurant.id}/menu/items`, payload);
        toast.success('Item added');
      }

      // Refresh menu
      const { data } = await axiosInstance.get(`/api/v1/restaurants/${activeRestaurant.id}/menu`);
      setCategories(data);
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  }

  async function handleDelete(itemId) {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axiosInstance.delete(`/api/v1/restaurants/${activeRestaurant.id}/menu/items/${itemId}`);
      const { data } = await axiosInstance.get(`/api/v1/restaurants/${activeRestaurant.id}/menu`);
      setCategories(data);
      toast.success('Item deleted');
    } catch { toast.error('Delete failed'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (restaurants.length === 0) return (
    <div className="page-container py-16 text-center">
      <Squares2X2Icon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Restaurants Found</h2>
      <p className="text-gray-500">You haven't registered any restaurants yet.</p>
    </div>
  );

  const allItems = categories.flatMap((c) => c.menuItems || []);

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Squares2X2Icon className="w-7 h-7 text-orange-500" />
            Manage Menu
          </h1>
          {restaurants.length > 1 && (
            <select className="input-field mt-2 w-auto text-sm" value={activeRestaurant?.id} onChange={(e) => setActive(restaurants.find((r) => r.id === parseInt(e.target.value)))}>
              {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Items', value: allItems.length },
          { label: 'Available',   value: allItems.filter((i) => i.isAvailable).length },
          { label: 'Categories',  value: categories.length },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu by category */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="card overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3 font-semibold text-gray-800 dark:text-white">
              {cat.name} <span className="text-gray-400 font-normal text-sm">({cat.menuItems?.length || 0})</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {(cat.menuItems || []).map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                  <img src={item.imageUrl || 'https://via.placeholder.com/48'} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{item.name}</span>
                      {item.isVeg
                        ? <span className="w-4 h-4 rounded border-2 border-green-600 flex items-center justify-center flex-shrink-0"><span className="w-2 h-2 bg-green-600 rounded-full" /></span>
                        : <span className="w-4 h-4 rounded border-2 border-red-600 flex items-center justify-center flex-shrink-0"><span className="w-2 h-2 bg-red-600 rounded-full" /></span>
                      }
                      {item.isBestseller && <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded-full">🔥 Bestseller</span>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {item.discountedPrice ? (
                      <div>
                        <p className="font-bold text-orange-500">{formatCurrency(item.discountedPrice)}</p>
                        <p className="text-xs text-gray-400 line-through">{formatCurrency(item.price)}</p>
                      </div>
                    ) : (
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.price)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-orange-500 transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editItem ? 'Edit Item' : 'Add Menu Item'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><XMarkIcon className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name *</label>
                  <input className="input-field" placeholder="e.g. Margherita Pizza" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea className="input-field resize-none" rows={2} placeholder="Brief description…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
                    <input type="number" className="input-field" placeholder="199" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discounted Price (₹)</label>
                    <input type="number" className="input-field" placeholder="Optional" value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                  <input className="input-field" placeholder="https://…" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">No category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calories</label>
                    <input type="number" className="input-field" placeholder="Optional" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prep Time (min)</label>
                    <input type="number" className="input-field" value={form.preparationTimeMinutes} onChange={(e) => setForm({ ...form, preparationTimeMinutes: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: 'isVeg', label: '🌿 Veg' },
                    { key: 'isAvailable', label: '✅ Available' },
                    { key: 'isBestseller', label: '🔥 Bestseller' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="w-4 h-4 accent-orange-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : editItem ? 'Update' : 'Add Item'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
