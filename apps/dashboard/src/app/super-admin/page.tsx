'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Users, CreditCard, Box, TrendingUp, Activity, BarChart3 } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const metrics = useQuery(api.admin.getPlatformMetrics);

  if (!metrics) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p className="animate-pulse text-gray-500 text-lg font-medium">Loading platform intelligence...</p>
      </div>
    );
  }

  const cards = [
    { title: 'Total Users', value: metrics.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Subs', value: metrics.activeSubscriptions, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Est. MRR', value: `$${metrics.mrr.toFixed(2)}`, icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Content Created', value: metrics.totalContent, icon: Box, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <TrendingUp className="text-indigo-600" size={36} />
          Platform Health
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Real-time metrics across Social Engine</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-3 rounded-xl`}>
                <card.icon className={card.color} size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-gray-400" />
            <h2 className="text-xl font-bold text-gray-800">Tier Distribution</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(metrics.tierDistribution).map(([tier, count]: [string, any]) => (
              <div key={tier} className="flex items-center">
                <span className="w-24 text-sm font-semibold text-gray-600 uppercase">{tier}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden mx-4">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${(count / metrics.totalUsers) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Growth Engine</h2>
            <p className="text-indigo-100 opacity-80 mb-6">Platform is scaling at a steady pace.</p>
            <div className="text-5xl font-black mb-1 flex items-baseline gap-1">
              {((metrics.activeSubscriptions / metrics.totalUsers) * 100).toFixed(1)}%
              <span className="text-xl font-normal opacity-60">conversion</span>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 opacity-10">
            <TrendingUp size={300} strokeWidth={1} />
          </div>
        </div>
      </div>
    </div>
  );
}
