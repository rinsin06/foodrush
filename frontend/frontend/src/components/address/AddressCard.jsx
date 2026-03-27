import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { MapPinIcon, PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { deleteAddress, setDefaultAddress } from '../../store/slices/addressSlice';
import toast from 'react-hot-toast';

export default function AddressCard({ address, onEdit, selectable = false, selected = false, onSelect }) {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    if (!confirm('Delete this address?')) return;
    await dispatch(deleteAddress(address.id));
    toast.success('Address deleted');
  };

  const handleSetDefault = async () => {
    await dispatch(setDefaultAddress(address.id));
    toast.success('Default address updated');
  };

  const labelEmoji = address.label === 'Home' ? '🏠' : address.label === 'Work' ? '💼' : '📍';

  return (
    <motion.div
      whileHover={{ scale: selectable ? 1.01 : 1 }}
      onClick={selectable ? onSelect : undefined}
      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
        selected
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200'
      }`}
    >
      {/* Default badge */}
      {address.isDefault && (
        <span className="absolute top-3 right-3 text-xs bg-orange-100 dark:bg-orange-900/30
                         text-orange-600 dark:text-orange-400 font-semibold px-2 py-0.5 rounded-full">
          Default
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center
                        justify-center text-lg shrink-0">
          {labelEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 dark:text-white">{address.label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
            {address.addressLine}
          </p>
          {address.landmark && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              📌 {address.landmark}
            </p>
          )}
          {address.city && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              🏙️ {address.city}
            </p>
          )}
          {address.latitude && address.longitude && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" />
              GPS saved
            </p>
          )}
        </div>
      </div>

      {!selectable && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          {!address.isDefault && (
            <button onClick={handleSetDefault}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500
                         hover:text-orange-500 transition-colors">
              <StarIcon className="w-3.5 h-3.5" /> Set default
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={onEdit}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500
                         hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
              <PencilIcon className="w-4 h-4" />
            </button>
            <button onClick={handleDelete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500
                         hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}