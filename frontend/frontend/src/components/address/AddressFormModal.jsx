import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { addAddress, updateAddress } from '../../store/slices/addressSlice';
import { selectCity } from '../../store/slices/locationSlice';
import toast from 'react-hot-toast';

const LABELS = ['Home', 'Work', 'Other'];

export default function AddressFormModal({ onClose, existing = null }) {
  const dispatch = useDispatch();
  const currentCity = useSelector(selectCity);

  const [form, setForm] = useState({
    label:       existing?.label       || 'Home',
    addressLine: existing?.addressLine || '',
    landmark:    existing?.landmark    || '',
    city:        existing?.city        || currentCity || '',
    latitude:    existing?.latitude    || null,
    longitude:   existing?.longitude   || null,
    isDefault:   existing?.isDefault   || false,
  });
  const [detecting, setDetecting] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address;
          const fullAddress = [
            addr.house_number,
            addr.road,
            addr.neighbourhood || addr.suburb,
          ].filter(Boolean).join(', ');
          const city = addr.city || addr.town || addr.village || addr.state_district || '';
          setForm(f => ({
            ...f,
            addressLine: fullAddress || f.addressLine,
            city,
            latitude,
            longitude,
          }));
          toast.success('Location detected!');
        } catch {
          toast.error('Could not get address details');
        } finally {
          setDetecting(false);
        }
      },
      () => {
        toast.error('Location permission denied');
        setDetecting(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSave = async () => {
    if (!form.addressLine.trim()) {
      toast.error('Please enter an address');
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await dispatch(updateAddress({ id: existing.id, ...form }));
        toast.success('Address updated!');
      } else {
        await dispatch(addAddress(form));
        toast.success('Address saved!');
      }
      onClose();
    } catch {
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md
                   border border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <MapPinIcon className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              {existing ? 'Edit Address' : 'Add New Address'}
            </h2>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Label selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              Label
            </label>
            <div className="flex gap-2">
              {LABELS.map((l) => (
                <button key={l} onClick={() => setForm(f => ({ ...f, label: l }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    form.label === l
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                  {l === 'Home' ? '🏠' : l === 'Work' ? '💼' : '📍'} {l}
                </button>
              ))}
            </div>
          </div>

          {/* Detect location button */}
          <button onClick={handleDetectLocation} disabled={detecting}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed
                       border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400
                       font-semibold py-3 px-4 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20
                       transition-all disabled:opacity-60 text-sm">
            {detecting ? (
              <><div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              Detecting...</>
            ) : (
              <><MapPinIcon className="w-4 h-4" /> Use current location</>
            )}
          </button>

          {/* Address line */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              Address *
            </label>
            <textarea
              value={form.addressLine}
              onChange={(e) => setForm(f => ({ ...f, addressLine: e.target.value }))}
              placeholder="House/flat no, street, area..."
              rows={2} className="input-field resize-none text-sm" />
          </div>

          {/* Landmark */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              Landmark (optional)
            </label>
            <input
              value={form.landmark}
              onChange={(e) => setForm(f => ({ ...f, landmark: e.target.value }))}
              placeholder="Near a famous place, building name..."
              className="input-field text-sm" />
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
              City
            </label>
            <input
              value={form.city}
              onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="City"
              className="input-field text-sm" />
          </div>

          {/* Coords display if detected */}
          {form.latitude && form.longitude && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20
                            border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
              <MapPinIcon className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                GPS: {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}
              </p>
            </div>
          )}

          {/* Set as default */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setForm(f => ({ ...f, isDefault: !f.isDefault }))}
              className={`w-10 h-6 rounded-full transition-all relative ${
                form.isDefault ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                form.isDefault ? 'left-5' : 'left-1'
              }`} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Set as default address
            </span>
          </label>

          {/* Save button */}
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600
                       hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all
                       disabled:opacity-70 shadow-lg shadow-orange-400/20">
            {saving ? 'Saving...' : existing ? 'Update Address' : 'Save Address'}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}