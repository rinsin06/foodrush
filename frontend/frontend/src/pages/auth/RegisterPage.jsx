import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { registerUser, selectAuthLoading } from '../../store/slices/authSlice.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'USER' });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const result = await dispatch(registerUser(form));
    if (!result.error) navigate('/');
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl
                            flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">F</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Join FoodRush today</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
            label="Full Name" value={form.name} onChange={set('name')} error={errors.name} placeholder="John Doe" />
            <Input className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
            label="Email address" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" />
            <Input className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
            label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} placeholder="Min. 8 characters" />
            <Input className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
            label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</label>
              <select value={form.role} onChange={set('role')}
                className="input-field cursor-pointer">
                <option value="USER">Customer - Order food</option>
                <option value="RESTAURANT">Restaurant Owner - List my restaurant</option>
              </select>
            </div>
            <Button type="submit" loading={isLoading} fullWidth className="py-3 mt-2">
              Create Account
            </Button>
          </form>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
