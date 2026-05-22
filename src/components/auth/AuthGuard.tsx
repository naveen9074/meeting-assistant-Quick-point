import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuthStore } from '../../store/useAuthStore';
import { User } from '../../types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  onShowLogin: () => void;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, onShowLogin }) => {
  const { token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setChecking(false);
        onShowLogin();
        return;
      }
      try {
        const user = await invoke<User>('verify_token', { token });
        setAuth(user, token);
        setChecking(false);
      } catch {
        clearAuth();
        setChecking(false);
        onShowLogin();
      }
    };
    verify();
  }, []);

  if (checking) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0f0f0f', color: '#888', fontSize: '14px'
      }}>
        Verifying session...
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
};

export default AuthGuard;
