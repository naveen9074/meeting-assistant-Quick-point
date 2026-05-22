import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuthStore } from '../../store/useAuthStore';
import { User, AccessRequest, InterviewSession } from '../../types/auth';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'requests' | 'users' | 'sessions' | 'config'>('requests');
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [config, setConfig] = useState<[string, string][]>([]);
  const [configKey, setConfigKey] = useState('');
  const [configVal, setConfigVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'requests') setRequests(await invoke<AccessRequest[]>('admin_get_access_requests'));
      if (tab === 'users') setUsers(await invoke<User[]>('admin_get_users'));
      if (tab === 'sessions') setSessions(await invoke<InterviewSession[]>('admin_get_all_sessions'));
      if (tab === 'config') setConfig(await invoke<[string, string][]>('admin_get_system_config'));
    } catch (e: any) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const approve = async (id: string) => {
    try {
      await invoke('admin_approve_request', { requestId: id, adminUserId: user?.id });
      setMsg('Approved'); load();
    } catch (e: any) { setMsg(String(e)); }
  };

  const reject = async (id: string) => {
    try {
      await invoke('admin_reject_request', { requestId: id, adminUserId: user?.id });
      setMsg('Rejected'); load();
    } catch (e: any) { setMsg(String(e)); }
  };

  const saveConfig = async () => {
    if (!configKey.trim()) return;
    try {
      await invoke('admin_set_system_config', { key: configKey, value: configVal, adminUserId: user?.id });
      setMsg('Saved'); setConfigKey(''); setConfigVal(''); load();
    } catch (e: any) { setMsg(String(e)); }
  };

  const tabStyle = (t: string) => ({
    padding: '6px 14px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px',
    background: tab === t ? '#2563eb' : 'transparent',
    color: tab === t ? '#fff' : '#888', border: 'none',
  });

  const row = { display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e1e1e' } as React.CSSProperties;
  const badge = (v: string) => ({
    display: 'inline-block', padding: '2px 7px', borderRadius: '3px', fontSize: '11px', fontWeight: 600,
    background: v === 'admin' ? '#1e3a5f' : v === 'pending' ? '#3a2800' : v === 'approved' ? '#0f2a1a' : '#2a1515',
    color: v === 'admin' ? '#60a5fa' : v === 'pending' ? '#fbbf24' : v === 'approved' ? '#4ade80' : '#f87171',
  } as React.CSSProperties);

  return (
    <div style={{ padding: '20px', color: '#ccc', height: '100%', overflowY: 'auto', background: '#0f0f0f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 600 }}>Admin Dashboard</h2>
        {msg && <span style={{ fontSize: '12px', color: '#4ade80' }}>{msg}</span>}
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {(['requests', 'users', 'sessions', 'config'] as const).map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => { setTab(t); setMsg(''); }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'requests' && requests.length > 0 && (
              <span style={{ marginLeft: '5px', background: '#ef4444', borderRadius: '10px', padding: '0 5px', fontSize: '10px', color: '#fff' }}>
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#555', fontSize: '13px' }}>Loading...</p>}

      {!loading && tab === 'requests' && (
        requests.length === 0
          ? <p style={{ color: '#444', fontSize: '13px' }}>No pending requests.</p>
          : requests.map(r => (
            <div key={r.id} style={row}>
              <div style={{ flex: 1, fontSize: '13px' }}>
                <strong style={{ color: '#fff' }}>{r.username}</strong>
                <span style={{ color: '#555', marginLeft: '8px', fontSize: '11px' }}>{r.email}</span>
                {r.request_message && <p style={{ margin: '2px 0 0', color: '#666', fontSize: '11px' }}>{r.request_message}</p>}
              </div>
              <button onClick={() => approve(r.id)} style={{ background: '#14532d', border: 'none', borderRadius: '4px', color: '#4ade80', padding: '5px 12px', fontSize: '11px', cursor: 'pointer' }}>Approve</button>
              <button onClick={() => reject(r.id)} style={{ background: '#450a0a', border: 'none', borderRadius: '4px', color: '#f87171', padding: '5px 12px', fontSize: '11px', cursor: 'pointer' }}>Reject</button>
            </div>
          ))
      )}

      {!loading && tab === 'users' && (
        users.length === 0
          ? <p style={{ color: '#444', fontSize: '13px' }}>No users found.</p>
          : users.map(u => (
            <div key={u.id} style={row}>
              <div style={{ flex: 1 }}>
                <span style={{ color: '#fff', fontSize: '13px' }}>{u.username}</span>
                <span style={{ color: '#555', fontSize: '11px', marginLeft: '8px' }}>{u.email}</span>
              </div>
              <span style={badge(u.role)}>{u.role}</span>
              <span style={badge(u.is_active ? 'approved' : 'pending')}>{u.is_active ? 'active' : 'inactive'}</span>
            </div>
          ))
      )}

      {!loading && tab === 'sessions' && (
        sessions.length === 0
          ? <p style={{ color: '#444', fontSize: '13px' }}>No sessions yet.</p>
          : sessions.map(s => (
            <div key={s.id} style={row}>
              <div style={{ flex: 1 }}>
                <span style={{ color: '#fff', fontSize: '13px' }}>{s.title}</span>
                <span style={{ color: '#555', fontSize: '11px', marginLeft: '8px' }}>{s.session_type}</span>
              </div>
              <span style={badge(s.status === 'completed' ? 'approved' : 'pending')}>{s.status}</span>
              <span style={{ fontSize: '11px', color: '#444' }}>{s.started_at.slice(0, 10)}</span>
            </div>
          ))
      )}

      {!loading && tab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {config.map(([k, v]) => (
            <div key={k} style={row}>
              <span style={{ color: '#aaa', fontSize: '12px', width: '160px' }}>{k}</span>
              <span style={{ color: '#fff', fontSize: '12px' }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
            <input value={configKey} onChange={e => setConfigKey(e.target.value)} placeholder="config_key"
              style={{ background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', padding: '6px 8px', fontSize: '12px', outline: 'none', width: '150px' }} />
            <input value={configVal} onChange={e => setConfigVal(e.target.value)} placeholder="value"
              style={{ background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', padding: '6px 8px', fontSize: '12px', outline: 'none', flex: 1 }} />
            <button onClick={saveConfig}
              style={{ background: '#2563eb', border: 'none', borderRadius: '4px', color: '#fff', padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}>
              Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
