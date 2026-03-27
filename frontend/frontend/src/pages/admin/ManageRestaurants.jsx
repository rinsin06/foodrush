import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingStorefrontIcon, PlusIcon, PencilIcon, TrashIcon,
  MagnifyingGlassIcon, XMarkIcon, ExclamationTriangleIcon,
  Bars3Icon, ChevronRightIcon, ArrowLeftIcon, TagIcon
} from '@heroicons/react/24/outline';
import { restaurantApi } from '../../api/restaurantApi.js';
import axiosInstance from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  OPEN:               'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CLOSED:             'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  TEMPORARILY_CLOSED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PENDING_APPROVAL:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const EMPTY_RESTAURANT = {
  name: '', description: '', address: '', city: '', phone: '',
  cuisineType: '', imageUrl: '', deliveryTime: 30,
  deliveryFee: 40, minimumOrder: 0, status: 'OPEN',
};

const EMPTY_ITEM = {
  name: '', description: '', price: '', discountedPrice: '',
  category: '', imageUrl: '', isVeg: true, isAvailable: true,
};

/* ─────────────────────────────────────────────
   VIEW MODES: 'list' | 'menu'
───────────────────────────────────────────── */
export default function ManageRestaurants() {
  const [view,           setView]           = useState('list');
  const [restaurants,    setRestaurants]    = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [search,         setSearch]         = useState('');

  // Restaurant CRUD
  const [showRestForm,   setShowRestForm]   = useState(false);
  const [editRest,       setEditRest]       = useState(null);
  const [restForm,       setRestForm]       = useState(EMPTY_RESTAURANT);
  const [savingRest,     setSavingRest]     = useState(false);
  const [deleteRestTarget, setDeleteRestTarget] = useState(null);
  const [deletingRest,   setDeletingRest]   = useState(false);

  // Menu view
  const [activeRest,     setActiveRest]     = useState(null);  // restaurant being managed
  const [categories,     setCategories]     = useState([]);
  const [menuLoading,    setMenuLoading]    = useState(false);

  // Menu item CRUD
  const [showItemForm,   setShowItemForm]   = useState(false);
  const [editItem,       setEditItem]       = useState(null);
  const [itemForm,       setItemForm]       = useState(EMPTY_ITEM);
  const [savingItem,     setSavingItem]     = useState(false);
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);
  const [deletingItem,   setDeletingItem]   = useState(false);

  // Category
  const [showCatForm,    setShowCatForm]    = useState(false);
  const [catName,        setCatName]        = useState('');
  const [savingCat,      setSavingCat]      = useState(false);

  useEffect(() => { loadRestaurants(); }, []);

  async function loadRestaurants() {
    try {
      setIsLoading(true);
      const { data } = await restaurantApi.getAll({ page: 0, size: 50 });
      setRestaurants(data.content || data);
    } catch { toast.error('Failed to load restaurants'); }
    finally  { setIsLoading(false); }
  }

  async function loadMenu(restaurantId) {
    try {
      setMenuLoading(true);
      const { data } = await axiosInstance.get(`/api/v1/restaurants/${restaurantId}/menu`);
      setCategories(data || []);
    } catch { toast.error('Failed to load menu'); }
    finally  { setMenuLoading(false); }
  }

  function openMenuView(r) {
    setActiveRest(r);
    setView('menu');
    loadMenu(r.id);
  }

  /* ── Restaurant CRUD ── */
  function openCreateRest() { setEditRest(null); setRestForm(EMPTY_RESTAURANT); setShowRestForm(true); }
  function openEditRest(r) {
    setEditRest(r);
    setRestForm({
      name: r.name || '', description: r.description || '',
      address: r.address || '', city: r.city || '',
      phone: r.phone || '', cuisineType: r.cuisineType || '',
      imageUrl: r.imageUrl || '', deliveryTime: r.deliveryTime || 30,
      deliveryFee: r.deliveryFee || 40, minimumOrder: r.minimumOrder || 0,
      status: r.status || 'OPEN',
    });
    setShowRestForm(true);
  }

  async function handleSaveRest() {
    if (!restForm.name.trim())    { toast.error('Name is required'); return; }
    if (!restForm.address.trim()) { toast.error('Address is required'); return; }
    try {
      setSavingRest(true);
      if (editRest) {
        const { data } = await restaurantApi.update(editRest.id, restForm);
        setRestaurants(prev => prev.map(r => r.id === editRest.id ? data : r));
        if (activeRest?.id === editRest.id) setActiveRest(data);
        toast.success('Restaurant updated');
      } else {
        const { data } = await restaurantApi.create(restForm);
        setRestaurants(prev => [data, ...prev]);
        toast.success('Restaurant created');
      }
      setShowRestForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSavingRest(false); }
  }

  async function handleStatusChange(id, status) {
    try {
      await restaurantApi.updateStatus(id, status);
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  }

  async function confirmDeleteRest() {
    try {
      setDeletingRest(true);
      await restaurantApi.delete(deleteRestTarget.id);
      setRestaurants(prev => prev.filter(r => r.id !== deleteRestTarget.id));
      toast.success(`"${deleteRestTarget.name}" deleted`);
      setDeleteRestTarget(null);
    } catch { toast.error('Failed to delete'); }
    finally  { setDeletingRest(false); }
  }

  /* ── Menu Item CRUD ── */
  function openCreateItem(categoryName) {
    setEditItem(null);
    setItemForm({ ...EMPTY_ITEM, category: categoryName });
    setShowItemForm(true);
  }

  function openEditItem(item) {
    setEditItem(item);
    setItemForm({
      name:           item.name           || '',
      description:    item.description    || '',
      price:          item.price          || '',
      discountedPrice:item.discountedPrice|| '',
      category:       item.category       || '',
      imageUrl:       item.imageUrl       || '',
      isVeg:          item.isVeg          ?? true,
      isAvailable:    item.isAvailable    ?? true,
    });
    setShowItemForm(true);
  }

  async function handleSaveItem() {
    if (!itemForm.name.trim())  { toast.error('Item name is required'); return; }
    if (!itemForm.price)        { toast.error('Price is required'); return; }
    try {
      setSavingItem(true);
      const payload = {
        ...itemForm,
        price:           parseFloat(itemForm.price),
        discountedPrice: itemForm.discountedPrice ? parseFloat(itemForm.discountedPrice) : null,
      };
      if (editItem) {
        const { data } = await axiosInstance.put(
          `/api/v1/restaurants/${activeRest.id}/menu/items/${editItem.id}`, payload
        );
        setCategories(prev => prev.map(cat => ({
          ...cat,
          menuItems: cat.menuItems?.map(i => i.id === editItem.id ? data : i),
        })));
        toast.success('Item updated');
      } else {
        const { data } = await axiosInstance.post(
          `/api/v1/restaurants/${activeRest.id}/menu/items`, payload
        );
        setCategories(prev => prev.map(cat =>
          cat.name === payload.category
            ? { ...cat, menuItems: [...(cat.menuItems || []), data] }
            : cat
        ));
        toast.success('Item added');
      }
      setShowItemForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSavingItem(false); }
  }

  async function confirmDeleteItem() {
    try {
      setDeletingItem(true);
      await axiosInstance.delete(
        `/api/v1/restaurants/${activeRest.id}/menu/items/${deleteItemTarget.id}`
      );
      setCategories(prev => prev.map(cat => ({
        ...cat,
        menuItems: cat.menuItems?.filter(i => i.id !== deleteItemTarget.id),
      })));
      toast.success(`"${deleteItemTarget.name}" deleted`);
      setDeleteItemTarget(null);
    } catch { toast.error('Delete failed'); }
    finally  { setDeletingItem(false); }
  }

  /* ── Category ── */
  async function handleAddCategory() {
    if (!catName.trim()) { toast.error('Category name required'); return; }
    try {
      setSavingCat(true);
      const { data } = await axiosInstance.post(
        `/api/v1/restaurants/${activeRest.id}/menu/categories`,
        { name: catName }
      );
      setCategories(prev => [...prev, { ...data, menuItems: [] }]);
      setCatName('');
      setShowCatForm(false);
      toast.success('Category added');
    } catch { toast.error('Failed to add category'); }
    finally  { setSavingCat(false); }
  }

  const rf = (key) => (e) => setRestForm(p => ({ ...p, [key]: e.target.value }));
  const itf = (key) => (e) => setItemForm(p => ({ ...p, [key]: e.target.value }));

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.city || '').toLowerCase().includes(search.toLowerCase())
  );

  /* ════════════════════════════════════════
     MENU VIEW
  ════════════════════════════════════════ */
  if (view === 'menu' && activeRest) return (
    <div className="page-container py-8">
      {/* Menu Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => { setView('list'); setActiveRest(null); }}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {activeRest.imageUrl && (
            <img src={activeRest.imageUrl} alt={activeRest.name}
              className="w-12 h-12 rounded-xl object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{activeRest.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Menu Management</p>
          </div>
        </div>
        <button onClick={() => setShowCatForm(true)}
          className="btn-secondary flex items-center gap-2 text-sm shrink-0">
          <TagIcon className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Categories & Items */}
      {menuLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bars3Icon className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No menu categories yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Start by adding a category</p>
          <button onClick={() => setShowCatForm(true)} className="btn-primary">
            Add First Category
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id || cat.name} className="card overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-4
                              bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700
                                   px-2 py-0.5 rounded-full">
                    {cat.menuItems?.length || 0} items
                  </span>
                </div>
                <button onClick={() => openCreateItem(cat.name)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-orange-500
                             hover:text-orange-600 transition-colors">
                  <PlusIcon className="w-4 h-4" /> Add Item
                </button>
              </div>

              {/* Items */}
              {(!cat.menuItems || cat.menuItems.length === 0) ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-gray-400 text-sm">No items in this category</p>
                  <button onClick={() => openCreateItem(cat.name)}
                    className="text-orange-500 text-sm font-medium mt-2 hover:text-orange-600 transition-colors">
                    + Add first item
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {cat.menuItems.map((item) => (
                    <div key={item.id}
                      className="flex items-center gap-4 px-5 py-4
                                 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      {/* Veg/Non-veg indicator */}
                      <div className={`w-4 h-4 shrink-0 rounded-sm border-2 flex items-center justify-center ${
                        item.isVeg ? 'border-green-500' : 'border-red-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          item.isVeg ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>

                      {/* Image */}
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700
                                        flex items-center justify-center shrink-0 text-2xl">
                          🍽️
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</p>
                          {!item.isAvailable && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                              Unavailable
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-gray-400 text-xs mt-0.5 truncate">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {item.discountedPrice ? (
                            <>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                ₹{item.discountedPrice}
                              </span>
                              <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-gray-900 dark:text-white">₹{item.price}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEditItem(item)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                                     text-gray-400 hover:text-orange-500 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteItemTarget({ id: item.id, name: item.name })}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                                     text-gray-400 hover:text-red-500 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Add Category Modal ── */}
      <AnimatePresence>
        {showCatForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Add Category</h3>
              <input className="input-field mb-4" placeholder="e.g. Starters, Main Course, Drinks..."
                value={catName} onChange={(e) => setCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} />
              <div className="flex gap-3">
                <button onClick={() => { setShowCatForm(false); setCatName(''); }}
                  className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleAddCategory} disabled={savingCat} className="btn-primary flex-1">
                  {savingCat ? 'Adding…' : 'Add Category'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add/Edit Item Modal ── */}
      <AnimatePresence>
        {showItemForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg
                         max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100
                              dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h2 className="font-bold text-gray-900 dark:text-white">
                  {editItem ? 'Edit Item' : 'Add Menu Item'}
                </h2>
                <button onClick={() => setShowItemForm(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Image preview */}
                {itemForm.imageUrl && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img src={itemForm.imageUrl} alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display='none'} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Item Name *
                    </label>
                    <input className="input-field" placeholder="e.g. Paneer Butter Masala"
                      value={itemForm.name} onChange={itf('name')} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Description
                    </label>
                    <textarea className="input-field resize-none" rows={2}
                      placeholder="Short description..."
                      value={itemForm.description} onChange={itf('description')} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Price (₹) *
                    </label>
                    <input type="number" className="input-field" placeholder="199"
                      value={itemForm.price} onChange={itf('price')} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Discounted Price (₹)
                    </label>
                    <input type="number" className="input-field" placeholder="Optional"
                      value={itemForm.discountedPrice} onChange={itf('discountedPrice')} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Category
                    </label>
                    <input className="input-field" placeholder="e.g. Starters"
                      value={itemForm.category} onChange={itf('category')} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Image URL
                    </label>
                    <input className="input-field" placeholder="https://..."
                      value={itemForm.imageUrl} onChange={itf('imageUrl')} />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-3">
                  {[
                    { key: 'isVeg', label: '🌿 Vegetarian', color: 'green' },
                    { key: 'isAvailable', label: '✅ Available', color: 'orange' },
                  ].map(({ key, label, color }) => (
                    <button key={key}
                      onClick={() => setItemForm(p => ({ ...p, [key]: !p[key] }))}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        itemForm[key]
                          ? color === 'green'
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-600'
                            : 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600'
                          : 'border-gray-200 dark:border-gray-700 text-gray-400'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 p-5 pt-0">
                <button onClick={() => setShowItemForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSaveItem} disabled={savingItem} className="btn-primary flex-1">
                  {savingItem
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block mr-2" />Saving…</>
                    : editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Item Confirm */}
      <AnimatePresence>
        {deleteItemTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-center">Delete Item?</h3>
              <p className="text-gray-500 text-sm text-center mt-2 mb-6">
                Delete <span className="font-bold text-gray-800 dark:text-white">"{deleteItemTarget.name}"</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteItemTarget(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={confirmDeleteItem} disabled={deletingItem}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold
                             py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {deletingItem
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><TrashIcon className="w-4 h-4" />Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  /* ════════════════════════════════════════
     LIST VIEW
  ════════════════════════════════════════ */
  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BuildingStorefrontIcon className="w-7 h-7 text-orange-500" />
            Manage Restaurants
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{restaurants.length} restaurants</p>
        </div>
        <button onClick={openCreateRest} className="btn-primary flex items-center gap-2 w-fit">
          <PlusIcon className="w-5 h-5" /> Add Restaurant
        </button>
      </div>

      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input className="input-field pl-10" placeholder="Search by name or city…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Restaurant', 'City', 'Cuisine', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-24 rounded" /></td>
                    ))}</tr>
                  ))
                : filtered.map((r, i) => (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={r.imageUrl || 'https://placehold.co/40x40?text=🍽️'}
                            alt={r.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{r.name}</p>
                            <p className="text-gray-400 text-xs truncate max-w-[180px]">{r.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.city || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r?.cuisines[0] || '—'}</td>
                      <td className="px-4 py-3"><span className="rating-chip">{r.rating ?? '—'}</span></td>
                      <td className="px-4 py-3">
                        <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[r.status]}`}>
                          <option value="OPEN">Open</option>
                          <option value="CLOSED">Closed</option>
                          <option value="TEMPORARILY_CLOSED">Temp. Closed</option>
                          <option value="PENDING_APPROVAL">Pending</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Manage Menu */}
                          <button onClick={() => openMenuView(r)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg
                                       bg-orange-50 dark:bg-orange-900/20 text-orange-600
                                       hover:bg-orange-100 transition-colors font-medium">
                            <Bars3Icon className="w-3.5 h-3.5" /> Menu
                          </button>
                          <button onClick={() => openEditRest(r)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                                       text-gray-500 hover:text-orange-500 transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteRestTarget({ id: r.id, name: r.name })}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                                       text-gray-500 hover:text-red-500 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No restaurants found</div>
          )}
        </div>
      </div>

      {/* ── Create/Edit Restaurant Modal ── */}
      <AnimatePresence>
        {showRestForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100
                              dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-5 h-5 text-orange-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editRest ? 'Edit Restaurant' : 'Add Restaurant'}
                  </h2>
                </div>
                <button onClick={() => setShowRestForm(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {restForm.imageUrl && (
                  <div className="w-full h-40 rounded-2xl overflow-hidden bg-gray-100">
                    <img src={restForm.imageUrl} alt="preview" className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display='none'} />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key:'name',        label:'Restaurant Name *', placeholder:'e.g. Spice Garden',     span:2 },
                    { key:'description', label:'Description',       placeholder:'Brief description...',  span:2, area:true },
                    { key:'address',     label:'Address *',         placeholder:'Full address',           span:2 },
                    { key:'city',        label:'City',              placeholder:'Bengaluru' },
                    { key:'phone',       label:'Phone',             placeholder:'9876543210' },
                    { key:'cuisineType', label:'Cuisine Type',      placeholder:'Indian, Pizza...' },
                    { key:'imageUrl',    label:'Image URL',         placeholder:'https://...',            span:2 },
                  ].map(({ key, label, placeholder, span, area }) => (
                    <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                      {area
                        ? <textarea className="input-field resize-none" rows={2} placeholder={placeholder}
                            value={restForm[key]} onChange={rf(key)} />
                        : <input className="input-field" placeholder={placeholder}
                            value={restForm[key]} onChange={rf(key)} />}
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Delivery Time (mins)</label>
                    <input type="number" className="input-field" value={restForm.deliveryTime} onChange={rf('deliveryTime')} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Delivery Fee (₹)</label>
                    <input type="number" className="input-field" value={restForm.deliveryFee} onChange={rf('deliveryFee')} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Minimum Order (₹)</label>
                    <input type="number" className="input-field" value={restForm.minimumOrder} onChange={rf('minimumOrder')} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select className="input-field" value={restForm.status} onChange={rf('status')}>
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                      <option value="TEMPORARILY_CLOSED">Temporarily Closed</option>
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 pt-0">
                <button onClick={() => setShowRestForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSaveRest} disabled={savingRest} className="btn-primary flex-1">
                  {savingRest
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block mr-2" />Saving…</>
                    : editRest ? 'Update' : 'Create Restaurant'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Restaurant Confirm ── */}
      <AnimatePresence>
        {deleteRestTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">Delete Restaurant?</h3>
              <p className="text-gray-500 text-sm text-center mt-2 mb-6">
                Are you sure you want to delete{' '}
                <span className="font-bold text-gray-800 dark:text-white">"{deleteRestTarget.name}"</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteRestTarget(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={confirmDeleteRest} disabled={deletingRest}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold
                             py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {deletingRest
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><TrashIcon className="w-4 h-4" />Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}