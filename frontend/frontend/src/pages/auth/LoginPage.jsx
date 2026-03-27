import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { loginUser, selectAuthLoading } from '../../store/slices/authSlice.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useSelector(selectAuthLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from || '/';

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(loginUser({ email, password }));
    if (!result.error) navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl
                            flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">F</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your FoodRush account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
            label="Email address" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} error={errors.email}
              placeholder="you@example.com" autoComplete="email" />
            <div className="relative">
              <Input label="Password" className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white" 
              type={showPassword ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                error={errors.password} placeholder="Your password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            <Button type="submit" loading={isLoading} fullWidth className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-xs text-center text-orange-700 dark:text-orange-400"
>
              Sign In
            </Button>
          </form>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600">Sign up</Link>
          </p>
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-xs text-center text-orange-700 dark:text-orange-400">
            Demo: admin@foodrush.com / Admin@123
          </div>
        </div>

      </motion.div>
    </div>
  );
}
