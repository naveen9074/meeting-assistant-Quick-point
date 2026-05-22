import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface RegisterPageProps {
  onGoToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onGoToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const msg = await invoke<string>('register_user', {
        request: { username: username.trim(), email: email.trim(), password },
      });
      setMessage(msg);
      setDone(true);
    } catch (e: any) {
      setError(typeof e === 'string' ? e : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0f0f0f', fontFamily: 'inherit'
    }}>
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px',
        padding: '36px 32px', width: '340px', display: 'flex', flexDirection: 'column', gap: '14px'
      }}>
        <div style={{ marginBottom: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>
            Request Access
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>
            Admin will approve your account.
          </p>
        </div>

        {done ? (
          <div style={{
            background: '#0f2a1a', border: '1px solid #1a5a2a', borderRadius: '4px',
            padding: '12px', fontSize: '13px', color: '#4ade80', textAlign: 'center'
          }}>
            {message}
            <br />
            <button
              onClick={onGoToLogin}
              style={{
                marginTop: '12px', background: 'transparent', border: '1px solid #2a2a2a',
                borderRadius: '4px', color: '#888', padding: '6px 16px',
                fontSize: '12px', cursor: 'pointer'
              }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div style={{
                background: '#2a1515', border: '1px solid #5a2020', borderRadius: '4px',
                padding: '8px 12px', fontSize: '12px', color: '#ff6b6b'
              }}>
                {error}
              </div>
            )}

            {[
              { label: 'Username', value: username, setter: setUsername, type: 'text', placeholder: 'Choose a username' },
              { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'your@email.com' },
              { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: 'Min 6 characters' },
              { label: 'Confirm Password', value: confirm, setter: setConfirm, type: 'password', placeholder: 'Repeat password' },
            ].map(field => (
              <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: '#888' }}>{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    background: '#111', border: '1px solid #333', borderRadius: '4px',
                    color: '#fff', padding: '8px 10px', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>
            ))}

            <button
              onClick={handleRegister}
              disabled={loading}
              style={{
                background: loading ? '#333' : '#2563eb', border: 'none', borderRadius: '4px',
                color: '#fff', padding: '9px', fontSize: '13px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>

            <button
              onClick={onGoToLogin}
              style={{
                background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '4px',
                color: '#666', padding: '7px', fontSize: '12px', cursor: 'pointer'
              }}
            >
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
