'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useState } from 'react';
import { Id } from '@convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { Search, UserCog, Ban, ShieldAlert, Eye } from 'lucide-react';

export default function SuperAdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const users = useQuery(api.admin.getUsers, { searchTerm, tierFilter });
  const forceTierChange = useMutation(api.admin.forceTierChange);
  const toggleBanUser = useMutation(api.admin.toggleBanUser);
  const startImpersonation = useMutation(api.admin.startImpersonation);
  const router = useRouter();

  if (!users) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p className="animate-pulse text-gray-500">Loading user database...</p>
      </div>
    );
  }

  const handleImpersonate = async (userId: Id<"users">) => {
    try {
      await startImpersonation({ targetUserId: userId });
      router.push('/dashboard'); 
    } catch (err) {
      console.error(err);
      alert("Failed to start impersonation");
    }
  };

  const handleForceTierChange = async (userId: Id<"users">, newTier: string) => {
    await forceTierChange({ userId, newTier });
  };

  const handleToggleBan = async (userId: Id<"users">, isBanned: boolean) => {
    if (confirm(`Are you sure you want to ${isBanned ? 'ban' : 'unban'} this user?`)) {
      await toggleBanUser({ userId, isBanned });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <UserCog className="text-indigo-600" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage accounts, tiers, and platform access</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 flex items-center gap-2">
          <ShieldAlert size={18} className="text-indigo-600" />
          <span className="text-indigo-700 font-semibold text-sm">{users.length} Total Users</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter Tier:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-gray-50 border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="business">Business</option>
            <option value="agency">Agency</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Profile</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Tier</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-full bg-gray-100 border" src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.email}`} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{user.name || 'Anonymous User'}</div>
                      <div className="text-sm text-gray-500 font-mono">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.plan}
                    onChange={(e) => handleForceTierChange(user._id, e.target.value)}
                    className="text-sm border-gray-200 rounded-md focus:ring-indigo-500 bg-transparent uppercase font-semibold"
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                    <option value="agency">Agency</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{(user as any).contentCount || 0}</span>
                    <span className="text-xs text-gray-500">Posts Made</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isBanned ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Banned
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleImpersonate(user._id)}
                      className="flex items-center gap-1 bg-white border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      title="Impersonate User"
                    >
                      <Eye size={16} />
                      <span className="hidden lg:inline">Impersonate</span>
                    </button>
                    <button
                      onClick={() => handleToggleBan(user._id, !user.isBanned)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all shadow-sm ${
                        user.isBanned 
                          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-600 hover:text-white' 
                          : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-600 hover:text-white'
                      }`}
                      title={user.isBanned ? 'Unban User' : 'Ban User'}
                    >
                      <Ban size={16} />
                      <span className="hidden lg:inline">{user.isBanned ? 'Unban' : 'Ban'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
