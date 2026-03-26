'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

type RuleType = 'event-to-social' | 'event-to-newsletter' | 'weekly-digest';

type RuleFormState = {
  name: string;
  type: RuleType;
  platforms: string;
  schedule: string;
};

const EMPTY_FORM: RuleFormState = {
  name: '',
  type: 'event-to-social',
  platforms: '',
  schedule: '',
};

const TYPE_OPTIONS: { value: RuleType; label: string; description: string }[] = [
  { value: 'event-to-social', label: 'Event → Social Post', description: 'Auto-generate social posts when new events are created' },
  { value: 'event-to-newsletter', label: 'Event → Newsletter', description: 'Include new events in email newsletters' },
  { value: 'weekly-digest', label: 'Weekly Digest', description: 'Send a weekly roundup of upcoming events' },
];

export default function AutomationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RuleFormState>(EMPTY_FORM);

  const rules = useQuery(api.automations.listRules);
  const queueItems = useQuery(api.automations.listQueueItems, {});
  const createRule = useMutation(api.automations.createRule);
  const updateRuleMut = useMutation(api.automations.updateRule);
  const deleteRuleMut = useMutation(api.automations.deleteRule);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      const platforms = form.platforms
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      await createRule({
        name: form.name,
        type: form.type,
        config: {
          platforms: platforms.length > 0 ? platforms : undefined,
          schedule: form.schedule || undefined,
        },
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create rule:', err);
    }
  };

  const handleToggle = async (ruleId: any, currentEnabled: boolean) => {
    try {
      await updateRuleMut({ ruleId, enabled: !currentEnabled });
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const handleDelete = async (ruleId: any) => {
    try {
      await deleteRuleMut({ ruleId });
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const isLoading = rules === undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Automations</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>
            Create rules to automate your content workflow
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#8e44ad',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(142,68,173,0.3)',
          }}
        >
          {showForm ? 'Cancel' : '+ New Rule'}
        </button>
      </div>

      {/* Create Rule Form */}
      {showForm && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Create New Rule</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
              Rule Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Auto-post for new music events"
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
                Rule Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as RuleType })}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  backgroundColor: 'white',
                }}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
                Platforms (comma-separated)
              </label>
              <input
                type="text"
                value={form.platforms}
                onChange={(e) => setForm({ ...form, platforms: e.target.value })}
                placeholder="instagram, twitter, linkedin"
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {form.type === 'weekly-digest' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
                Schedule (cron expression)
              </label>
              <input
                type="text"
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                placeholder="0 9 * * 1 (every Monday at 9am)"
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
            {TYPE_OPTIONS.find((t) => t.value === form.type)?.description}
          </p>

          <button
            onClick={handleCreate}
            disabled={!form.name.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: form.name.trim() ? '#8e44ad' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: form.name.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              alignSelf: 'flex-end',
            }}
          >
            Create Rule
          </button>
        </div>
      )}

      {/* Rules List and Queue Items */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Rules List */}
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Your Rules</h2>

          {isLoading && (
            <div style={{
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #ddd',
              textAlign: 'center',
              color: '#999',
            }}>
              Loading rules...
            </div>
          )}

          {!isLoading && rules.length === 0 && (
            <div style={{
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #ddd',
              textAlign: 'center',
              color: '#999',
            }}>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                No automation rules yet. Create one to get started.
              </p>
            </div>
          )}

          {!isLoading && rules.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #ddd',
              overflow: 'hidden',
            }}>
              {rules.map((rule: any, idx: number) => (
                <div
                  key={rule._id}
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderBottom: idx < rules.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(rule._id, rule.enabled)}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: rule.enabled ? '#8e44ad' : '#ccc',
                      cursor: 'pointer',
                      position: 'relative',
                      flexShrink: 0,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <span style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '3px',
                      left: rule.enabled ? '23px' : '3px',
                      transition: 'left 0.2s',
                      display: 'block',
                    }} />
                  </button>

                  {/* Info */}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{rule.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                      {TYPE_OPTIONS.find((t) => t.value === rule.type)?.label || rule.type}
                      {rule.config?.platforms?.length ? ` • ${rule.config.platforms.join(', ')}` : ''}
                      {rule.runCount > 0 ? ` • ${rule.runCount} runs` : ''}
                    </div>
                  </div>

                  {/* Status */}
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backgroundColor: rule.enabled ? '#e8f5e9' : '#f5f5f5',
                    color: rule.enabled ? '#2e7d32' : '#999',
                  }}>
                    {rule.enabled ? 'Active' : 'Paused'}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(rule._id)}
                    style={{
                      padding: '0.4rem 0.6rem',
                      backgroundColor: 'transparent',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#999',
                      fontSize: '0.8rem',
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Queue / Execution History */}
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Executions</h2>

          {queueItems === undefined && (
            <div style={{
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #ddd',
              textAlign: 'center',
              color: '#999',
            }}>
              Loading history...
            </div>
          )}

          {queueItems !== undefined && queueItems.length === 0 && (
            <div style={{
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #ddd',
              textAlign: 'center',
              color: '#999',
            }}>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                No executions yet. Rules will log activity here.
              </p>
            </div>
          )}

          {queueItems !== undefined && queueItems.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #ddd',
              overflow: 'hidden',
            }}>
              {queueItems.map((item: any, idx: number) => (
                <div
                  key={item._id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: idx < queueItems.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {item.triggerData?.source || 'Unknown'}
                    </span>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      backgroundColor:
                        item.status === 'completed' ? '#e8f5e9' :
                        item.status === 'failed' ? '#ffebee' :
                        item.status === 'processing' ? '#e3f2fd' :
                        '#f5f5f5',
                      color:
                        item.status === 'completed' ? '#2e7d32' :
                        item.status === 'failed' ? '#c62828' :
                        item.status === 'processing' ? '#1565c0' :
                        '#999',
                    }}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : 'Unknown time'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
