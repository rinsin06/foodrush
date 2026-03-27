import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectUser,
  selectIsAuthenticated,
  selectUserRoles,
  selectAuthLoading,
  loginUser,
  registerUser,
  logoutUser,
  updateProfile,
  clearError,
} from '../store/slices/authSlice.js';

export function useAuth() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector(selectUser);
  const isAuth    = useSelector(selectIsAuthenticated);
  const roles     = useSelector(selectUserRoles);
  const isLoading = useSelector(selectAuthLoading);

  const isAdmin      = roles.includes('ADMIN');
  const isRestaurant = roles.includes('RESTAURANT');
  const isUser       = roles.includes('USER') || (!isAdmin && !isRestaurant);

  async function login(credentials) {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      const userRoles = result.payload.user.roles || [];
      if (userRoles.includes('ADMIN'))      navigate('/admin');
      else if (userRoles.includes('RESTAURANT')) navigate('/restaurant-panel');
      else navigate('/');
      return true;
    }
    return false;
  }

  async function register(userData) {
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      navigate('/');
      return true;
    }
    return false;
  }

  async function logout() {
    await dispatch(logoutUser());
    navigate('/login');
  }

  async function updateUserProfile(data) {
    return dispatch(updateProfile(data));
  }

  function hasRole(role) {
    return roles.includes(role);
  }

  function clearAuthError() {
    dispatch(clearError());
  }

  return {
    user,
    isAuthenticated: isAuth,
    isLoading,
    isAdmin,
    isRestaurant,
    isUser,
    roles,
    login,
    register,
    logout,
    updateUserProfile,
    hasRole,
    clearAuthError,
  };
}
