'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useState } from 'react';
import { Save, RefreshCw, X, Check } from 'lucide-react';

const FEATURES = [
  { key: 'monthlyPrice', label: 'Price ($)', type: 'number' },
  { key: 'aiCaptionsLimit', label: 'AI Captions Limit', type: 'number' },
  { key: 'videoGenLimit', label: 'Video Gen Limit', type: 'number' },
  { key: 'voiceClonesLimit', label: 'Voice Clones Limit', type: 'number' },
  { key: 'directPosting', label: 'Direct Posting', type: 'boolean' },
  { key: 'scheduling', label: 'Scheduling', type: 'boolean' },
  { key: 'analyticsAccess', label: 'Analytics Access', type: 'boolean' },
  { key: 'analyticsDepth', label: 'Analytics Depth', type: 'select', options: ['none', 'basic', 'advanced', 'full'] },
  { key: 'automations', label: 'Automations', type: 'boolean' },
  { key: 'flowLimit', label: 'Flow Limit', type: 'number' },
  { key: 'apiAccess', label: 'API Access', type: 'boolean' },
  { key: 'rateLimit', label: 'Rate Limit (req/min)', type: 'number' },
  { key: 'whiteLabel', label: 'White Label', type: 'boolean' },
  { key: 'prioritySupport', label: 'Priority Support', type: 'boolean' },
  { key: 'exportQualityCap', label: 'Export Quality Cap', type: 'select', options: ['720p', '1080p', '4k'] },
];

export default function SuperAdminTiersPage() {
  const tierConfigs = useQuery(api.admin.getTierConfigs);
  const updateTierConfig = useMutation(api.admin.updateTierConfig);
  const seedTierConfigs = useMutation(api.admin.seedTierConfigs);
  
  const [editing, setEditing] = useState<Record<string, any>>({}); // { tierId: { featureKey: value } }
  const [loading, setLoading] = useState(false);

  if (!tierConfigs) return <div className="p-8">Loading configs...</div>;

  if (tierConfigs.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">No Tier Configs Found</h1>
        <button 
          onClick={() => seedTierConfigs()}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <RefreshCw size={16} /> Seed Default Configs
        </button>
      </div>
    );
  }

  const handleEdit = (tierId: string, key: string, value: any) => {
    setEditing(prev => ({
      ...prev,
      [tierId]: {
        ...(prev[tierId] || {}),
        [key]: value
      }
    }));
  };

  const handleSave = async (tierId: string, dbId: any) => {
    setLoading(true);
    try {
      await updateTierConfig({ id: dbId, updates: editing[tierId] });
      setEditing(prev => {
        const next = { ...prev };
        delete next[tierId];
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (tierId: string) => {
    setEditing(prev => {
      const next = { ...prev };
      delete next[tierId];
      return next;
    });
  };

  return (
    <div className="p-4 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tier Feature Matrix</h1>
        <div className="flex gap-2">
          {Object.keys(editing).length > 0 && (
            <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Unsaved changes...
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
              {tierConfigs.map(tier => (
                <th key={tier.tierId} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-l">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{tier.tierName}</span>
                    <div className="mt-2 flex gap-1">
                      {editing[tier.tierId] && (
                        <>
                          <button 
                            onClick={() => handleSave(tier.tierId, tier._id)}
                            disabled={loading}
                            className="bg-green-600 text-white p-1 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => handleCancel(tier.tierId)}
                            disabled={loading}
                            className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {FEATURES.map(feat => (
              <tr key={feat.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-48">
                  {feat.label}
                </td>
                {tierConfigs.map(tier => {
                  const val = editing[tier.tierId]?.[feat.key] ?? (tier as any)[feat.key];
                  return (
                    <td key={tier.tierId} className="px-4 py-2 text-sm border-l min-w-[120px]">
                      {feat.type === 'boolean' ? (
                        <input 
                          type="checkbox" 
                          checked={!!val} 
                          onChange={(e) => handleEdit(tier.tierId, feat.key, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      ) : feat.type === 'number' ? (
                        <input 
                          type="number" 
                          value={val ?? ''} 
                          onChange={(e) => handleEdit(tier.tierId, feat.key, parseFloat(e.target.value))}
                          className="w-full border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : feat.type === 'select' ? (
                        <select 
                          value={val ?? ''} 
                          onChange={(e) => handleEdit(tier.tierId, feat.key, e.target.value)}
                          className="w-full border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {feat.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={val ?? ''} 
                          onChange={(e) => handleEdit(tier.tierId, feat.key, e.target.value)}
                          className="w-full border-gray-300 rounded px-2 py-1"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
