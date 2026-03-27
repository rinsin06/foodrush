import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TagIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';

const EMPTY = {
  code: '', description: '', discountType: 'PERCENTAGE',
  discountValue: '', maxDiscountAmount: '', minimumOrderAmount: '0',
  maxUses: '', validFrom: '', validUntil: '', isActive: true,
};

export default function ManageOffers() {
  const [coupons, setCoupons]       = useState([]);
  const [isLoading, setLoading]     = useState(true);
  const [showModal, setModal]       = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, code }
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/v1/coupons');
      setCoupons(data);
    } catch { toast.error('Failed to load coupons'); }
    finally  { setLoading(false); }
  }

  function openCreate() { setEditId(null); setForm(EMPTY); setModal(true); }
  function openEdit(c)  {
    setEditId(c.id);
    setForm({ ...c, validFrom: c.validFrom?.slice(0, 16) || '', validUntil: c.validUntil?.slice(0, 16) || '' });
    setModal(true);
  }

  async function handleSave() {
    try {
      setSaving(true);
      if (editId) {
        const { data } = await axiosInstance.put(`/api/v1/coupons/${editId}`, form);
        setCoupons((prev) => prev.map((c) => c.id === editId ? data : c));
        toast.success('Coupon updated');
      } else {
        const { data } = await axiosInstance.post('/api/v1/coupons', form);
        setCoupons((prev) => [data, ...prev]);
        toast.success('Coupon created');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  }

  async function confirmDelete() {
    try {
      setDeleting(true);
      await axiosInstance.delete(`/api/v1/coupons/${deleteTarget.id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success(`Coupon "${deleteTarget.code}" deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Delete failed');
    } finally { setDeleting(false); }
  }

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TagIcon className="w-7 h-7 text-orange-500" /> Manage Offers & Coupons
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{coupons.length} coupons</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> New Coupon
        </button>
      </div>

      {/* Coupon Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)
          : coupons.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card p-5 relative overflow-hidden ${!c.isActive ? 'opacity-60' : ''}`}
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 dark:bg-orange-900/10 rounded-full" />
                <div className="flex items-start justify-between relative">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">{c.code}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{c.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                                 text-gray-400 hover:text-orange-500 transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget({ id: c.id, code: c.code })}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                                 text-gray-400 hover:text-red-500 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-500">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${c.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                 : 'bg-gray-100 text-gray-500'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Min. order: ₹{c.minimumOrderAmount}
                  {c.validUntil && ` · Expires ${new Date(c.validUntil).toLocaleDateString()}`}
                </div>
              </motion.div>
            ))
        }
      </div>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center
                              justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                Delete Coupon?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2">
                Are you sure you want to delete{' '}
                <span className="font-mono font-bold text-gray-800 dark:text-white">
                  {deleteTarget.code}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60
                             text-white font-semibold py-2.5 px-4 rounded-xl transition-colors
                             flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white
                                       rounded-full animate-spin" /> Deleting…</>
                  ) : (
                    <><TrashIcon className="w-4 h-4" /> Delete</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editId ? 'Edit Coupon' : 'Create Coupon'}
                </h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code *</label>
                  <input className="input-field font-mono uppercase" placeholder="e.g. SAVE20"
                    value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <input className="input-field" placeholder="Flat 20% off on orders above ₹199"
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
                    <select className="input-field" value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Value *</label>
                    <input type="number" className="input-field"
                      placeholder={form.discountType === 'PERCENTAGE' ? '20' : '50'}
                      value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Order (₹)</label>
                    <input type="number" className="input-field" value={form.minimumOrderAmount}
                      onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Discount (₹)</label>
                    <input type="number" className="input-field" placeholder="Optional cap"
                      value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid From</label>
                    <input type="datetime-local" className="input-field" value={form.validFrom}
                      onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until</label>
                    <input type="datetime-local" className="input-field" value={form.validUntil}
                      onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Total Uses</label>
                    <input type="number" className="input-field" placeholder="Unlimited"
                      value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input type="checkbox" id="active" checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 accent-orange-500" />
                    <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}