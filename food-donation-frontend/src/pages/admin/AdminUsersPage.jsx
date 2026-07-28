import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon, UsersIcon, CheckBadgeIcon, NoSymbolIcon, TrashIcon } from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import adminService from '../../services/adminService';
import { initials } from '../../utils/formatters';

const ROLE_TABS = ['ALL', 'DONOR', 'NGO', 'DELIVERY_AGENT', 'ADMIN'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0 });
  const [page, setPage] = useState(0);
  const [role, setRole] = useState('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getAllUsers({
        role: role === 'ALL' ? undefined : role,
        query: query || undefined,
        page, size: 10,
      });
      setUsers(result.content);
      setPageData(result);
    } finally {
      setLoading(false);
    }
  }, [role, query, page]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleStatusChange = async (userId, status) => {
    try {
      await adminService.updateUserStatus(userId, status);
      toast.success(`User ${status === 'BLOCKED' ? 'blocked' : 'updated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleApprove = async (user) => {
    try {
      if (user.roles?.includes('ROLE_NGO')) {
        await adminService.approveNgo(user.id);
      } else {
        await adminService.approveDonor(user.id);
      }
      toast.success('User approved');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve user');
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteUser(toDelete);
      toast.success('User deleted');
      setToDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mb-6">User Management</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
          <input className="input-field pl-11" placeholder="Search by name or email…"
            value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setRole(tab); setPage(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              role === tab
                ? 'bg-forest-700 text-cream-50'
                : 'bg-white dark:bg-forest-900 text-forest-600 dark:text-cream-300 hover:bg-forest-50 dark:hover:bg-forest-800 border border-forest-900/8 dark:border-cream-100/8'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}</div>
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" description="Try a different search or filter." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-forest-50 dark:bg-forest-800/50 text-forest-600 dark:text-cream-300 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Role</th>
                <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">City</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-900/8 dark:divide-cream-100/8">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-forest-50/50 dark:hover:bg-forest-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-forest-700 text-cream-50 flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
                        {u.profileImage ? <img src={u.profileImage} alt="" className="w-full h-full object-cover" /> : initials(u.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-forest-900 dark:text-cream-50 truncate">{u.fullName}</p>
                        <p className="text-xs text-forest-500 dark:text-cream-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-forest-600 dark:text-cream-300">
                    {u.roles?.map((r) => r.replace('ROLE_', '')).join(', ')}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-forest-600 dark:text-cream-300">{u.city || '—'}</td>
                  <td className="px-5 py-3.5"><Badge status={u.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {u.status === 'PENDING' && (
                        <button onClick={() => handleApprove(u)} className="btn-icon !w-8 !h-8 text-forest-600" title="Approve">
                          <CheckBadgeIcon className="w-4 h-4" />
                        </button>
                      )}
                      {u.status !== 'BLOCKED' ? (
                        <button onClick={() => handleStatusChange(u.id, 'BLOCKED')} className="btn-icon !w-8 !h-8 text-amber-600" title="Block">
                          <NoSymbolIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleStatusChange(u.id, 'ACTIVE')} className="btn-icon !w-8 !h-8 text-forest-600" title="Unblock">
                          <CheckBadgeIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setToDelete(u.id)} className="btn-icon !w-8 !h-8 text-tomato-600" title="Delete">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pageNumber={page} totalPages={pageData.totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this user?"
        message="This will permanently remove the user account and all associated data."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
