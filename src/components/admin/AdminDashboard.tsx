import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAuthStore } from "../../store/useAuthStore";
import { User, AccessRequest, InterviewSession } from "../../types/auth";

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"requests" | "users" | "sessions" | "config">(
    "requests"
  );
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [config, setConfig] = useState<[string, string][]>([]);
  const [configKey, setConfigKey] = useState("");
  const [configVal, setConfigVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      if (tab === "requests")
        setRequests(await invoke<AccessRequest[]>("admin_get_access_requests"));
      if (tab === "users") setUsers(await invoke<User[]>("admin_get_users"));
      if (tab === "sessions")
        setSessions(await invoke<InterviewSession[]>("admin_get_all_sessions"));
      if (tab === "config")
        setConfig(await invoke<[string, string][]>("admin_get_system_config"));
    } catch (e: any) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tab]);

  const approve = async (id: string) => {
    try {
      await invoke("admin_approve_request", {
        requestId: id,
        adminUserId: user?.id,
      });
      setMsg("Approved");
      load();
    } catch (e: any) {
      setMsg(String(e));
    }
  };

  const reject = async (id: string) => {
    try {
      await invoke("admin_reject_request", {
        requestId: id,
        adminUserId: user?.id,
      });
      setMsg("Rejected");
      load();
    } catch (e: any) {
      setMsg(String(e));
    }
  };

  const saveConfig = async () => {
    if (!configKey.trim()) return;
    try {
      await invoke("admin_set_system_config", {
        key: configKey,
        value: configVal,
        adminUserId: user?.id,
      });
      setMsg("Saved");
      setConfigKey("");
      setConfigVal("");
      load();
    } catch (e: any) {
      setMsg(String(e));
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const renderBadge = (value: string, label?: string) => {
    const text = label ?? value;
    const map: Record<string, React.CSSProperties> = {
      approved: {
        background: "rgba(16,185,129,0.12)",
        color: "var(--qp-success)",
      },
      active: {
        background: "rgba(16,185,129,0.12)",
        color: "var(--qp-success)",
      },
      pending: {
        background: "rgba(245,158,11,0.12)",
        color: "var(--qp-warning)",
      },
      rejected: {
        background: "rgba(239,68,68,0.12)",
        color: "var(--qp-danger)",
      },
      inactive: {
        background: "rgba(239,68,68,0.12)",
        color: "var(--qp-danger)",
      },
      admin: {
        background: "var(--color-accent-light)",
        color: "var(--color-accent)",
      },
    };
    const s = map[value] ?? {
      background: "rgba(107,114,128,0.12)",
      color: "var(--color-text-secondary)",
    };
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          padding: "3px 10px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: 700,
          ...s,
        }}
      >
        {text}
      </span>
    );
  };

  const renderEmpty = (icon: string, message: string) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "56px 24px",
        color: "var(--color-text-tertiary)",
      }}
    >
      <span style={{ fontSize: "34px", lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: "13px" }}>{message}</span>
    </div>
  );

  const card: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    padding: "14px 16px",
    boxShadow: "var(--shadow-sm)",
  };

  const inputBase: React.CSSProperties = {
    background: "var(--color-bg-subtle)",
    border: "1px solid var(--color-border)",
    borderRadius: "7px",
    color: "var(--color-text)",
    padding: "8px 10px",
    fontSize: "12px",
    outline: "none",
  };

  const msgIsSuccess = msg === "Approved" || msg === "Saved";
  const msgIsReject = msg === "Rejected";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        padding: "24px",
        height: "100%",
        overflowY: "auto",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes qp-spin { to { transform: rotate(360deg); } }
        .qp-spin { animation: qp-spin 0.75s linear infinite; }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--color-text)",
          }}
        >
          Admin Dashboard
        </h2>
        {msg && (
          <span
            style={{
              fontSize: "12px",
              padding: "5px 14px",
              borderRadius: "20px",
              fontWeight: 600,
              background: msgIsSuccess
                ? "rgba(16,185,129,0.12)"
                : msgIsReject
                  ? "rgba(239,68,68,0.12)"
                  : "var(--color-accent-light)",
              color: msgIsSuccess
                ? "var(--qp-success)"
                : msgIsReject
                  ? "var(--qp-danger)"
                  : "var(--color-accent)",
            }}
          >
            {msg}
          </span>
        )}
      </div>

      {/* ── Tab pills ── */}
      <div
        style={{
          display: "inline-flex",
          gap: "4px",
          marginBottom: "24px",
          background: "var(--color-bg-subtle)",
          border: "1px solid var(--color-border)",
          padding: "4px",
          borderRadius: "12px",
        }}
      >
        {(["requests", "users", "sessions", "config"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setMsg("");
            }}
            style={{
              padding: "7px 18px",
              fontSize: "13px",
              cursor: "pointer",
              borderRadius: "8px",
              background: tab === t ? "var(--color-accent)" : "transparent",
              color: tab === t ? "#ffffff" : "var(--color-text-secondary)",
              border: "none",
              fontWeight: tab === t ? 600 : 400,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "requests" && requests.length > 0 && (
              <span
                style={{
                  background: "var(--qp-danger)",
                  borderRadius: "20px",
                  padding: "1px 7px",
                  fontSize: "10px",
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Spinner ── */}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "var(--color-text-secondary)",
            fontSize: "13px",
            padding: "16px 0",
          }}
        >
          <div
            className="qp-spin"
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              flexShrink: 0,
              border: "2px solid var(--color-border)",
              borderTopColor: "var(--color-accent)",
            }}
          />
          Loading…
        </div>
      )}

      {/* ── Requests tab ── */}
      {!loading &&
        tab === "requests" &&
        (requests.length === 0 ? (
          renderEmpty("📭", "No pending access requests.")
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {requests.map((r) => (
              <div key={r.id} style={card}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "var(--color-text)",
                    }}
                  >
                    {r.username}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                      marginTop: "2px",
                    }}
                  >
                    {r.email}
                  </div>
                  {r.request_message && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-tertiary)",
                        marginTop: "5px",
                        fontStyle: "italic",
                      }}
                    >
                      {r.request_message}
                    </div>
                  )}
                </div>
                {renderBadge("pending")}
                <button
                  onClick={() => approve(r.id)}
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.28)",
                    borderRadius: "7px",
                    color: "var(--qp-success)",
                    padding: "6px 14px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => reject(r.id)}
                  style={{
                    background: "rgba(239,68,68,0.10)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "7px",
                    color: "var(--qp-danger)",
                    padding: "6px 14px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  Reject
                </button>
              </div>
            ))}
          </div>
        ))}

      {/* ── Users tab ── */}
      {!loading &&
        tab === "users" &&
        (users.length === 0 ? (
          renderEmpty("👤", "No users found.")
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {users.map((u) => (
              <div key={u.id} style={card}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "var(--color-text)",
                    }}
                  >
                    {u.username}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                      marginTop: "2px",
                    }}
                  >
                    {u.email}
                  </div>
                </div>
                {renderBadge(u.role)}
                {renderBadge(u.is_active ? "active" : "inactive")}
              </div>
            ))}
          </div>
        ))}

      {/* ── Sessions tab ── */}
      {!loading &&
        tab === "sessions" &&
        (sessions.length === 0 ? (
          renderEmpty("📋", "No sessions yet.")
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sessions.map((s) => (
              <div key={s.id} style={card}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "var(--color-text)",
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                      marginTop: "2px",
                    }}
                  >
                    {s.session_type}
                  </div>
                </div>
                {renderBadge(
                  s.status === "completed" ? "approved" : "pending",
                  s.status
                )}
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-tertiary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.started_at.slice(0, 10)}
                </span>
              </div>
            ))}
          </div>
        ))}

      {/* ── Config tab ── */}
      {!loading && tab === "config" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quick toggle settings */}
          <div
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--color-text-secondary)",
                marginBottom: "16px",
              }}
            >
              System Feature Settings
            </div>
            {(
              [
                {
                  key: "enable_user_registration",
                  label: "User Registration",
                  hint: "Allow new users to register",
                },
                {
                  key: "enable_audio_upload",
                  label: "Audio Upload",
                  hint: "Allow users to upload audio files",
                },
                {
                  key: "enable_live_transcription",
                  label: "Live Transcription",
                  hint: "Real-time transcription during recording",
                },
                {
                  key: "enable_export",
                  label: "Export Feature",
                  hint: "Allow transcript/summary export",
                },
                {
                  key: "enable_advanced_model_requests",
                  label: "Advanced Model Requests",
                  hint: "Users can request advanced AI/Whisper models",
                },
              ] as const
            ).map((setting) => {
              const currentVal = config.find(([k]) => k === setting.key)?.[1];
              const isEnabled = currentVal !== "false" && currentVal !== "0";
              return (
                <div
                  key={setting.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      {setting.label}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-tertiary)",
                        marginTop: 2,
                      }}
                    >
                      {setting.hint}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newVal = isEnabled ? "false" : "true";
                      try {
                        await invoke("admin_set_system_config", {
                          key: setting.key,
                          value: newVal,
                          adminUserId: user?.id,
                        });
                        setMsg(isEnabled ? "Disabled" : "Enabled");
                        load();
                      } catch (e: any) {
                        setMsg(String(e));
                      }
                    }}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      background: isEnabled
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(239,68,68,0.10)",
                      color: isEnabled
                        ? "var(--qp-success)"
                        : "var(--qp-danger)",
                    }}
                  >
                    {isEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Model defaults */}
          <div
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--color-text-secondary)",
                marginBottom: "16px",
              }}
            >
              Default Models
            </div>
            {(
              [
                {
                  key: "default_ai_model",
                  label: "Default AI Model",
                  placeholder: "e.g. llama3.2, gemma2",
                },
                {
                  key: "default_whisper_model",
                  label: "Default Whisper Model",
                  placeholder: "e.g. tiny, base, small",
                },
              ] as const
            ).map((setting) => {
              const currentVal =
                config.find(([k]) => k === setting.key)?.[1] ?? "";
              return (
                <div
                  key={setting.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      {setting.label}
                    </div>
                    {currentVal && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--color-accent)",
                          marginTop: 2,
                        }}
                      >
                        Current: {currentVal}
                      </div>
                    )}
                  </div>
                  <input
                    defaultValue={currentVal}
                    placeholder={setting.placeholder}
                    style={{ ...inputBase, width: "160px" }}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (!val) return;
                        try {
                          await invoke("admin_set_system_config", {
                            key: setting.key,
                            value: val,
                            adminUserId: user?.id,
                          });
                          setMsg("Saved");
                          load();
                        } catch (err: any) {
                          setMsg(String(err));
                        }
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Current config values */}
          {config.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--color-text-tertiary)",
                  marginBottom: "10px",
                }}
              >
                All Configuration Entries
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {config.map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                    }}
                  >
                    <span
                      style={{
                        width: "220px",
                        flexShrink: 0,
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        fontFamily: "monospace",
                      }}
                    >
                      {k}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text)",
                        wordBreak: "break-all",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced: manual key/value */}
          <div
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--color-text-secondary)",
                marginBottom: "12px",
              }}
            >
              Advanced — Set Custom Key
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                value={configKey}
                onChange={(e) => setConfigKey(e.target.value)}
                placeholder="config_key"
                style={{ ...inputBase, width: "160px" }}
              />
              <input
                value={configVal}
                onChange={(e) => setConfigVal(e.target.value)}
                placeholder="value"
                style={{ ...inputBase, flex: 1 }}
              />
              <button
                onClick={saveConfig}
                style={{
                  background: "var(--color-accent)",
                  border: "none",
                  borderRadius: "7px",
                  color: "#ffffff",
                  padding: "8px 18px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
