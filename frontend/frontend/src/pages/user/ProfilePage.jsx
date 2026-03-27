import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { UserCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { selectUser, updateProfile, logoutUser } from '../../store/slices/authSlice.js';
import { fetchAddresses, selectAddresses, selectAddressLoading } from '../../store/slices/addressSlice.js';
import AddressCard from '../../components/address/AddressCard.jsx';
import AddressFormModal from '../../components/address/AddressFormModal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const addresses = useSelector(selectAddresses);
  const addressLoading = useSelector(selectAddressLoading);

  const [name,  setName]  = useState(user?.name  || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showAddressForm,  setShowAddressForm]  = useState(false);
  const [editingAddress,   setEditingAddress]   = useState(null);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await dispatch(updateProfile({ name, phone }));
    setIsSaving(false);
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="page-container py-8 max-w-2xl mx-auto space-y-6">
        <h1 className="section-heading">My Profile</h1>

        {/* ── Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          {/* Avatar + info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl
                            flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <p className="text-xs text-orange-500 font-semibold mt-0.5 uppercase tracking-wide">
                {(user?.roles || []).join(', ')}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <Input label="Full Name"  value={name}  onChange={(e) => setName(e.target.value)} />
            <Input label="Email"      value={user?.email || ''} disabled className="opacity-60" />
            <Input label="Phone"      value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} loading={isSaving} className="flex-1">
              Save Changes
            </Button>
            <Button variant="danger" onClick={() => dispatch(logoutUser())} className="px-6">
              Log Out
            </Button>
          </div>
        </motion.div>

        {/* ── Addresses Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <MapPinIcon className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
            </div>
            <button
              onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              + Add New
            </button>
          </div>

          {addressLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center
                              justify-center mx-auto mb-3">
                <MapPinIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                No saved addresses yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 mb-4">
                Save addresses for faster checkout
              </p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-orange-500 font-semibold text-sm hover:text-orange-600 transition-colors"
              >
                Add your first address →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onEdit={() => { setEditingAddress(addr); setShowAddressForm(true); }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <AddressFormModal
          existing={editingAddress}
          onClose={() => { setShowAddressForm(false); setEditingAddress(null); }}
        />
      )}
    </div>
  );
}