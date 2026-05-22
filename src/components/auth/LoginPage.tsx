import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuthStore } from '../../store/useAuthStore';
import { LoginResponse } from '../../types/auth';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onGoToRegister }) => {
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await invoke<LoginResponse>('login_user', {
        request: { username: username.trim(), password },
      });
      setAuth(res.user, res.token);
      onLoginSuccess();
    } catch (e: any) {
      setError(typeof e === 'string' ? e : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0f0f0f', fontFamily: 'inherit'
    }}>
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px',
        padding: '36px 32px', width: '340px', display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            QuickPoint
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
            AI Interview & Meeting Assistant
          </p>
        </div>

        {error && (
          <div style={{
            background: '#2a1515', border: '1px solid #5a2020', borderRadius: '4px',
            padding: '8px 12px', fontSize: '12px', color: '#ff6b6b'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: '#888' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter username"
            style={{
              background: '#111', border: '1px solid #333', borderRadius: '4px',
              color: '#fff', padding: '8px 10px', fontSize: '13px', outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: '#888' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter password"
            style={{
              background: '#111', border: '1px solid #333', borderRadius: '4px',
              color: '#fff', padding: '8px 10px', fontSize: '13px', outline: 'none'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            background: loading ? '#333' : '#2563eb', border: 'none', borderRadius: '4px',
            color: '#fff', padding: '9px', fontSize: '13px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <button
          onClick={onGoToRegister}
          style={{
            background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '4px',
            color: '#888', padding: '8px', fontSize: '12px', cursor: 'pointer'
          }}
        >
          New user? Request access
        </button>

        <p style={{ fontSize: '11px', color: '#444', textAlign: 'center', margin: 0 }}>
          Default admin: admin / admin123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
