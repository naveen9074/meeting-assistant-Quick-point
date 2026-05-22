import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuthStore } from '../../store/useAuthStore';
import { useSessionStore } from '../../store/useSessionStore';
import { InterviewSession } from '../../types/auth';

const SessionPanel: React.FC = () => {
  const { user } = useAuthStore();
  const { activeSessionId, setActiveSession, clearSession } = useSessionStore();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('interview');
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const loadSessions = async () => {
    if (!user) return;
    try {
      const list = await invoke<InterviewSession[]>('get_user_sessions', { userId: user.id });
      setSessions(list);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadSessions(); }, [user]);

  const createSession = async () => {
    if (!user || !newTitle.trim()) return;
    setCreating(true);
    try {
      const session = await invoke<InterviewSession>('create_session', {
        userId: user.id,
        title: newTitle.trim(),
        sessionType: newType,
      });
      setActiveSession(session.id, session.title);
      setNewTitle('');
      setShowCreate(false);
      loadSessions();
    } catch (e) { console.error(e); }
    setCreating(false);
  };


  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
      background: '#111', borderBottom: '1px solid #1e1e1e', flexShrink: 0, flexWrap: 'wrap'
    }}>
      <span style={{ fontSize: '11px', color: '#555', whiteSpace: 'nowrap' }}>Session:</span>

      <select
        value={activeSessionId || ''}
        onChange={e => {
          const s = sessions.find(x => x.id === e.target.value);
          if (s) setActiveSession(s.id, s.title);
          else clearSession();
        }}
        style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px',
          color: activeSessionId ? '#fff' : '#555', fontSize: '12px', padding: '4px 8px',
          outline: 'none', maxWidth: '200px'
        }}
      >
        <option value=''>— No session selected —</option>
        {sessions.map(s => (
          <option key={s.id} value={s.id}>
            {s.title} ({s.status})
          </option>
        ))}
      </select>

      <button
        onClick={() => setShowCreate(!showCreate)}
        style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px',
          color: '#888', fontSize: '11px', padding: '4px 10px', cursor: 'pointer'
        }}
      >
        + New
      </button>

      {activeSessionId && (
        <button
          onClick={async () => {
            try { await invoke('end_session', { sessionId: activeSessionId }); clearSession(); loadSessions(); }
            catch (e) { console.error(e); }
          }}
          style={{
            background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '4px',
            color: '#555', fontSize: '11px', padding: '4px 10px', cursor: 'pointer'
          }}
        >
          End
        </button>
      )}

      {showCreate && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', paddingTop: '6px' }}>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Session title..."
            onKeyDown={e => e.key === 'Enter' && createSession()}
            style={{
              background: '#111', border: '1px solid #333', borderRadius: '4px',
              color: '#fff', padding: '5px 8px', fontSize: '12px', outline: 'none', flex: 1
            }}
          />
          <select
            value={newType}
            onChange={e => setNewType(e.target.value)}
            style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px',
              color: '#aaa', fontSize: '12px', padding: '5px 8px', outline: 'none'
            }}
          >
            <option value='interview'>Interview</option>
            <option value='meeting'>Meeting</option>
          </select>
          <button
            onClick={createSession}
            disabled={creating}
            style={{
              background: '#2563eb', border: 'none', borderRadius: '4px',
              color: '#fff', fontSize: '12px', padding: '5px 14px', cursor: creating ? 'not-allowed' : 'pointer'
            }}
          >
            {creating ? '...' : 'Create'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionPanel;
