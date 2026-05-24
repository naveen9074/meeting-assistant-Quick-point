import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAuthStore } from "../../store/useAuthStore";
import { LoginResponse } from "../../types/auth";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoToRegister,
}) => {
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await invoke<LoginResponse>("login_user", {
        request: { username: username.trim(), password },
      });
      setAuth(res.user, res.token);
      onLoginSuccess();
    } catch (e: any) {
      setError(typeof e === "string" ? e : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    background: "var(--color-bg-subtle, #f8f7ff)",
    border: `1px solid ${focusedField === field ? "var(--color-accent)" : "var(--color-border)"}`,
    borderRadius: "8px",
    color: "var(--color-text)",
    padding: "10px 12px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--color-bg)",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border)",
          borderRadius: "16px",
          boxShadow: "var(--shadow-lg)",
          padding: "40px 36px",
          width: "100%",
          maxWidth: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          animation: "fadeIn 0.3s ease",
        }}
      >
        {/* Logo & Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <img
            src="/qlogo.png"
            alt="QuickPoint"
            style={{ width: 48, height: 48, marginBottom: 16 }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--color-accent)",
              letterSpacing: "-0.3px",
            }}
          >
            QuickPoint
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
            }}
          >
            AI Meeting Assistant
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "12px",
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        {/* Username */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            style={{
              fontSize: "12px",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
              marginBottom: "6px",
            }}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocusedField("username")}
            onBlur={() => setFocusedField(null)}
            placeholder="Enter username"
            style={inputStyle("username")}
          />
        </div>

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            style={{
              fontSize: "12px",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
              marginBottom: "6px",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            placeholder="Enter password"
            style={inputStyle("password")}
          />
        </div>

        {/* Sign In */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            background: "var(--color-accent)",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            padding: "10px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            marginTop: "4px",
            transition: "opacity 0.15s ease",
          }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        {/* Request Access */}
        <button
          onClick={onGoToRegister}
          style={{
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-text-secondary)",
            padding: "9px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          New user? Request access
        </button>

        {/* Hint */}
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-text-tertiary)",
            textAlign: "center",
            margin: 0,
          }}
        >
          Default admin: admin / admin123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
