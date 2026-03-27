import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon, MagnifyingGlassIcon,
  NoSymbolIcon, CheckCircleIcon, TrashIcon, FunnelIcon
} from '@heroicons/react/24/outline';
import axiosInstance from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';

const ROLE_BADGE = {
  ROLE_ADMIN:      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ROLE_RESTAURANT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ROLE_USER:       'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const ROLE_LABEL = {
  ROLE_ADMIN: 'ADMIN',
  ROLE_RESTAURANT: 'RESTAURANT',
  ROLE_USER: 'USER',
};

const STATUS_BADGE = {
  ACTIVE:               'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE:             'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  BLOCKED:              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PENDING_VERIFICATION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function ManageUsers() {
  const [users, setUsers]         = useState([]);
  const [isLoading, setLoading]   = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setFilter] = useState('ALL');
  const [deleteId, setDeleteId]   = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/v1/admin/users?size=100');
      // backend returns ApiResponse<PagedResponse<UserDTO>>
      setUsers(data.data?.content || data.content || data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await axiosInstance.put(`/api/v1/admin/users/${id}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => u.id === id ? { ...u, status: newStatus } : u)
      );
      toast.success(`User ${newStatus.toLowerCase()}`);
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function deleteUser(id) {
    try {
      await axiosInstance.delete(`/api/v1/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleteId(null);
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="w-7 h-7 text-orange-500" />
            Manage Users
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{users.length} registered users</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            className="input-field pl-10"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLOCKED">Blocked</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 w-20 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      {/* Avatar + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {u.profileImageUrl ? (
                            <img src={u.profileImageUrl} alt={u.name}
                              className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                              {u.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">{u.name || '—'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          {u.email}
                          {u.emailVerified && (
                            <span title="Verified" className="text-green-500">✓</span>
                          )}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.phone || '—'}</td>

                      {/* Roles */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(u.roles) ? u.roles : ['ROLE_USER']).map((role) => (
                            <span key={role}
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_BADGE[role] || ROLE_BADGE.ROLE_USER}`}>
                              {ROLE_LABEL[role] || role}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[u.status] || STATUS_BADGE.INACTIVE}`}>
                          {u.status}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {u.status === 'ACTIVE' ? (
                            <button
                              onClick={() => updateStatus(u.id, 'BLOCKED')}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                            >
                              <NoSymbolIcon className="w-3.5 h-3.5" /> Block
                            </button>
                          ) : (
                            <button
                              onClick={() => updateStatus(u.id, 'ACTIVE')}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors"
                            >
                              <CheckCircleIcon className="w-3.5 h-3.5" /> Activate
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteId(u.id)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
              }
            </tbody>
          </table>

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No users found</div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete User?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}