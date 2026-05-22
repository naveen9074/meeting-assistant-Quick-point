import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuthStore } from '../../store/useAuthStore';
import { InterviewSession } from '../../types/auth';

const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSessions = async () => {
    if (!user) return;
    try {
      const list = await invoke<InterviewSession[]>('get_user_sessions', { userId: user.id });
      setSessions(list);
    } catch (e) { console.error(e); }
  };

  const loadSessionDetail = async (id: string) => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        invoke<any[]>('get_session_transcripts', { sessionId: id }),
        invoke<any[]>('get_session_summaries', { sessionId: id }),
      ]);
      setTranscripts(t);
      setSummaries(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadSessions(); }, [user]);
  useEffect(() => { if (selected) loadSessionDetail(selected); }, [selected]);

  const row = { padding: '8px 10px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' } as React.CSSProperties;
  const statusColor = (s: string) => s === 'completed' ? '#4ade80' : '#fbbf24';

  return (
    <div style={{ display: 'flex', height: '100%', color: '#ccc', fontSize: '13px', background: '#0f0f0f' }}>
      {/* Left: session list */}
      <div style={{ width: '220px', borderRight: '1px solid #1a1a1a', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '12px 10px 8px', fontSize: '11px', color: '#444', borderBottom: '1px solid #1a1a1a' }}>
          MY SESSIONS
        </div>
        {sessions.map(s => (
          <div
            key={s.id}
            onClick={() => setSelected(s.id)}
            style={{ ...row, background: selected === s.id ? '#1a1a1a' : 'transparent' }}
          >
            <div style={{ fontWeight: 500, color: selected === s.id ? '#fff' : '#eaeaea' }}>
              {s.title}
            </div>
            <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>
              {new Date(s.started_at).toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: statusColor(s.status), marginTop: '4px' }}>
              {s.status.toUpperCase()}
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div style={{ padding: '10px', color: '#777', fontSize: '11px' }}>
            No sessions found.
          </div>
        )}
      </div>

      {/* Right: detail view */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {selected ? (
          loading ? (
            <div style={{ color: '#777' }}>Loading details...</div>
          ) : (
            <div>
              <h2 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px' }}>
                {sessions.find(s => s.id === selected)?.title || 'Session Details'}
              </h2>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Summaries
                </h3>
                {summaries.length === 0 ? (
                  <div style={{ color: '#555', fontSize: '12px' }}>No summaries available.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {summaries.map(sum => (
                      <div key={sum.id} style={{ background: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #1a1a1a' }}>
                        <div style={{ whiteSpace: 'pre-wrap', color: '#ccc' }}>{sum.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Transcripts
                </h3>
                {transcripts.length === 0 ? (
                  <div style={{ color: '#555', fontSize: '12px' }}>No transcripts available.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {transcripts.map(t => (
                      <div key={t.id} style={{ background: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #1a1a1a' }}>
                        <div style={{ fontWeight: 600, color: '#aaa', marginBottom: '4px', fontSize: '11px' }}>
                          Speaker {t.speaker || 'Unknown'}
                        </div>
                        <div style={{ color: '#eaeaea' }}>{t.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div style={{ color: '#555', marginTop: '20px', textAlign: 'center' }}>
            Select a session to view its details
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
