import { useDispatch, useSelector } from 'react-redux';
import { selectCartConflict, confirmRestaurantSwitch, cancelRestaurantSwitch } from '../../store/slices/cartSlice.js';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';

export default function RestaurantSwitchModal() {
  const dispatch = useDispatch();
  const conflict = useSelector(selectCartConflict);

  return (
    <Modal
      isOpen={!!conflict}
      onClose={() => dispatch(cancelRestaurantSwitch())}
      title="Start a new cart?"
    >
      <div className="text-center space-y-4">
        <div className="text-5xl">🛒</div>
        <p className="text-gray-600 dark:text-gray-300">
          Your cart has items from <strong className="text-gray-900 dark:text-white">another restaurant</strong>.
          Adding this item will clear your current cart.
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={() => dispatch(cancelRestaurantSwitch())}>
            Keep Current Cart
          </Button>
          <Button variant="danger" fullWidth onClick={() => dispatch(confirmRestaurantSwitch())}>
            Start New Cart
          </Button>
        </div>
      </div>
    </Modal>
  );
}
