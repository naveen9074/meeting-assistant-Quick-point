import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface RegisterPageProps {
  onGoToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onGoToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const msg = await invoke<string>("register_user", {
        request: { username: username.trim(), email: email.trim(), password },
      });
      setMessage(msg);
      setDone(true);
    } catch (e: any) {
      setError(typeof e === "string" ? e : "Registration failed.");
    } finally {
      setLoading(false);
    }
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
            marginBottom: "4px",
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
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--color-accent)",
            }}
          >
            Request Access
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
            }}
          >
            Admin will approve your account
          </p>
        </div>

        {done ? (
          /* Success state */
          <div
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "8px",
              padding: "20px 16px",
              fontSize: "13px",
              color: "#10b981",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <span>{message}</span>
            <button
              onClick={onGoToLogin}
              style={{
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                color: "var(--color-text-secondary)",
                padding: "7px 20px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ← Back to Login
            </button>
          </div>
        ) : (
          <>
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

            {/* Fields */}
            {[
              {
                label: "Username",
                value: username,
                setter: setUsername,
                type: "text",
                placeholder: "Choose a username",
              },
              {
                label: "Email",
                value: email,
                setter: setEmail,
                type: "email",
                placeholder: "your@email.com",
              },
              {
                label: "Password",
                value: password,
                setter: setPassword,
                type: "password",
                placeholder: "Min 6 characters",
              },
              {
                label: "Confirm Password",
                value: confirm,
                setter: setConfirm,
                type: "password",
                placeholder: "Repeat password",
              },
            ].map((field) => (
              <div
                key={field.label}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    marginBottom: "6px",
                  }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  onFocus={() => setFocusedField(field.label)}
                  onBlur={() => setFocusedField(null)}
                  placeholder={field.placeholder}
                  style={inputStyle(field.label)}
                />
              </div>
            ))}

            {/* Submit */}
            <button
              onClick={handleRegister}
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
              {loading ? "Submitting…" : "Submit Request"}
            </button>

            {/* Back to Login */}
            <button
              onClick={onGoToLogin}
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
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
