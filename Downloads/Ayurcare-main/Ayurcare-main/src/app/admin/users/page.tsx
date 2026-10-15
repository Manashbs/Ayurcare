'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Filter, Plus, Edit2, Trash2, ShieldAlert, CheckCircle, UserX, Key, Eye, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsersManager() {
  const { user: currentAdmin } = useAuth();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Editing state
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editSuspensionReason, setEditSuspensionReason] = useState('');
  
  // Doctor profile fields edit
  const [editDocQual, setEditDocQual] = useState('');
  const [editDocFee, setEditDocFee] = useState('');
  const [editDocExp, setEditDocExp] = useState('');
  const [editDocSpec, setEditDocSpec] = useState('');

  // Creating state
  const [creatingUser, setCreatingUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
  
  // Action notifications
  const [alertMsg, setAlertMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/users', window.location.origin);
      if (roleFilter) url.searchParams.append('role', roleFilter);
      if (statusFilter) url.searchParams.append('status', statusFilter);
      if (searchTerm) url.searchParams.append('search', searchTerm);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleEditClick = (u: any) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditStatus(u.status);
    setEditSuspensionReason(u.suspensionReason || '');

    if (u.role === 'DOCTOR' && u.doctorProfile) {
      setEditDocQual(u.doctorProfile.qualification || '');
      setEditDocFee(String(u.doctorProfile.feePerConsult || '500'));
      setEditDocExp(String(u.doctorProfile.experienceYears || '0'));
      setEditDocSpec(u.doctorProfile.specializations || '');
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setAlertMsg('');
    setActionLoading(true);

    try {
      const body: any = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        status: editStatus,
        suspensionReason: editStatus === 'SUSPENDED' ? editSuspensionReason : null,
      };

      if (editingUser.role === 'DOCTOR') {
        body.doctorProfile = {
          qualification: editDocQual,
          feePerConsult: parseFloat(editDocFee),
          experienceYears: parseInt(editDocExp),
          specializations: editDocSpec,
        };
      }

      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setAlertMsg('User settings updated successfully!');
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update user details.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setAlertMsg('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          phone: newPhone,
          role: newRole,
        }),
      });

      if (res.ok) {
        setAlertMsg('User account created successfully!');
        setCreatingUser(false);
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewPhone('');
        fetchUsers();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to create user account.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete ${name}? This action cascades and cannot be undone.`)) {
      return;
    }

    setErrorMsg('');
    setAlertMsg('');
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAlertMsg('User permanently purged from the platform.');
        fetchUsers();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || ' purges failed.');
      }
    } catch (e) {
      setErrorMsg('purges connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImpersonateUser = async (id: string) => {
    setErrorMsg('');
    setAlertMsg('');
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${id}/impersonate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg('Impersonation token active. Redirecting to workspace...');
        setTimeout(() => {
          window.location.href = data.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard';
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Impersonation failed.');
      }
    } catch (e) {
      setErrorMsg('Impersonation connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-white">User Accounts Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Full control over doctors, patients, and admins (CRUD & Impersonate).</p>
        </div>
        <button
          onClick={() => setCreatingUser(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition duration-200 flex items-center space-x-2 shadow-md cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Manual User Register</span>
        </button>
      </div>

      {/* Alert Messages */}
      {alertMsg && (
        <div className="bg-emerald-950/60 border border-emerald-900 text-emerald-300 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <CheckCircle className="w-5 h-5" />
          <span>{alertMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-950/60 border border-red-900 text-red-300 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filters & Search */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg items-end">
        <div className="sm:col-span-5 space-y-2">
          <label htmlFor="search-input" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Search Users</label>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, email, phone number..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-200 text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>
        </div>

        <div className="sm:col-span-3 space-y-2">
          <label htmlFor="role-select" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role Filter</label>
          <select
            id="role-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-200 text-sm"
          >
            <option value="">All Roles</option>
            <option value="PATIENT">Patients</option>
            <option value="DOCTOR">Doctors</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        <div className="sm:col-span-3 space-y-2">
          <label htmlFor="status-select" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Filter</label>
          <select
            id="status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-200 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending OTP</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>

        <div className="sm:col-span-1">
          <button
            type="submit"
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-sm transition cursor-pointer"
          >
            Go
          </button>
        </div>
      </form>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          <span>Syncing master table...</span>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Signup Date</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{u.email}</div>
                      {u.phone && <div className="text-xs text-slate-500">{u.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        u.role === 'ADMIN' ? 'bg-red-950 text-red-400 border border-red-900' :
                        u.role === 'DOCTOR' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                        'bg-blue-950 text-blue-400 border border-blue-900'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        u.status === 'ACTIVE' ? 'bg-green-950 text-green-400' :
                        u.status === 'PENDING' ? 'bg-yellow-950 text-yellow-500' :
                        'bg-red-950 text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEditClick(u)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleImpersonateUser(u.id)}
                        className="p-2 bg-slate-800 hover:bg-emerald-900 text-emerald-400 rounded transition cursor-pointer"
                        title="Impersonate User"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-2 bg-slate-800 hover:bg-red-950 text-red-400 rounded transition cursor-pointer"
                        title="Purge User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Creation Modal */}
      {creatingUser && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-8 shadow-2xl relative">
            <h3 className="font-display text-xl font-bold text-white mb-6">Manually Create User Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label htmlFor="new-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                <input
                  id="new-name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="new-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  id="new-email"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="new-pass" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <input
                  id="new-pass"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="new-phone" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                <input
                  id="new-phone"
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="new-role" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role Type</label>
                <select
                  id="new-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none bg-slate-950"
                >
                  <option value="PATIENT">Patient Profile</option>
                  <option value="DOCTOR">Doctor Profile</option>
                  <option value="ADMIN">Super Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreatingUser(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-400 font-bold rounded-lg text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm flex items-center cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editing user Drawer/Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-8 shadow-2xl overflow-y-auto max-h-[85vh]">
            <h3 className="font-display text-xl font-bold text-white mb-6">Edit Account: {editingUser.name}</h3>
            
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-xs font-bold text-slate-400 uppercase mb-1">Name</label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-955 text-slate-200 text-sm border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                <input
                  id="edit-email"
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-955 text-slate-200 text-sm border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label htmlFor="edit-phone" className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone</label>
                <input
                  id="edit-phone"
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-955 text-slate-200 text-sm border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-status" className="block text-xs font-bold text-slate-400 uppercase mb-1">Account Status</label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-955 text-slate-200 text-sm border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-900"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="BANNED">BANNED</option>
                  </select>
                </div>
              </div>

              {editStatus === 'SUSPENDED' && (
                <div>
                  <label htmlFor="edit-reason" className="block text-xs font-bold text-slate-400 uppercase mb-1">Suspension Reason</label>
                  <input
                    id="edit-reason"
                    type="text"
                    required
                    value={editSuspensionReason}
                    onChange={(e) => setEditSuspensionReason(e.target.value)}
                    placeholder="e.g. Incomplete profile details, violating policy"
                    className="w-full px-4 py-2 bg-slate-955 text-slate-200 text-sm border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              )}

              {/* Doctor Details (conditional) */}
              {editingUser.role === 'DOCTOR' && (
                <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest">Doctor Profile Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-qual" className="block text-xs font-bold text-slate-400 uppercase mb-1">Qualification</label>
                      <input
                        id="edit-qual"
                        type="text"
                        value={editDocQual}
                        onChange={(e) => setEditDocQual(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-955 text-slate-200 text-sm border border-slate-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-fee" className="block text-xs font-bold text-slate-400 uppercase mb-1">Consult Fee (INR)</label>
                      <input
                        id="edit-fee"
                        type="number"
                        value={editDocFee}
                        onChange={(e) => setEditDocFee(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-955 text-slate-200 text-sm border border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="edit-exp" className="block text-xs font-bold text-slate-400 uppercase mb-1">Exp Years</label>
                      <input
                        id="edit-exp"
                        type="number"
                        value={editDocExp}
                        onChange={(e) => setEditDocExp(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-955 text-slate-200 text-sm border border-slate-700 rounded-lg"
                      />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="edit-spec" className="block text-xs font-bold text-slate-400 uppercase mb-1">Specialization</label>
                      <input
                        id="edit-spec"
                        type="text"
                        value={editDocSpec}
                        onChange={(e) => setEditDocSpec(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-955 text-slate-200 text-sm border border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-400 font-bold rounded-lg text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm flex items-center cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
