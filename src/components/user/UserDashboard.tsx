import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAuthStore } from "../../store/useAuthStore";
import { InterviewSession } from "../../types/auth";

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
      const list = await invoke<InterviewSession[]>("get_user_sessions", {
        userId: user.id,
      });
      setSessions(list);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSessionDetail = async (id: string) => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        invoke<any[]>("get_session_transcripts", { sessionId: id }),
        invoke<any[]>("get_session_summaries", { sessionId: id }),
      ]);
      setTranscripts(t);
      setSummaries(s);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, [user]);
  useEffect(() => {
    if (selected) loadSessionDetail(selected);
  }, [selected]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const selectedSession = sessions.find((s) => s.id === selected);

  const renderStatusBadge = (status: string) => {
    const done = status === "completed";
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "2px 9px",
          borderRadius: "20px",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase" as const,
          background: done ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
          color: done ? "var(--qp-success)" : "var(--qp-warning)",
        }}
      >
        {status}
      </span>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontSize: "13px",
      }}
    >
      <style>{`
        @keyframes qp-spin { to { transform: rotate(360deg); } }
        .qp-spin { animation: qp-spin 0.75s linear infinite; }
        .qp-session-item:hover { background: var(--color-sidebar-hover) !important; }
      `}</style>

      {/* ── Left panel: session list ── */}
      <div
        style={{
          width: "240px",
          flexShrink: 0,
          borderRight: "1px solid var(--color-border)",
          background: "var(--color-sidebar)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "14px 14px 10px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--color-text-tertiary)",
            textTransform: "uppercase",
            borderBottom: "1px solid var(--color-border-subtle)",
            flexShrink: 0,
          }}
        >
          My Sessions
        </div>

        {sessions.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "40px 16px",
              color: "var(--color-text-tertiary)",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "26px" }}>📂</span>
            <span style={{ fontSize: "12px" }}>No sessions found.</span>
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className="qp-session-item"
              onClick={() => setSelected(s.id)}
              style={{
                padding: "12px 14px",
                cursor: "pointer",
                borderBottom: "1px solid var(--color-border-subtle)",
                background:
                  selected === s.id
                    ? "var(--color-sidebar-selected)"
                    : "transparent",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "var(--color-text)",
                  marginBottom: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                  marginBottom: "7px",
                }}
              >
                {new Date(s.started_at).toLocaleString()}
              </div>
              {renderStatusBadge(s.status)}
            </div>
          ))
        )}
      </div>

      {/* ── Right panel: detail view ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 32px",
          background: "var(--color-bg)",
        }}
      >
        {!selected ? (
          /* Empty state — nothing selected */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "12px",
              color: "var(--color-text-tertiary)",
            }}
          >
            <span style={{ fontSize: "44px", lineHeight: 1 }}>🗂️</span>
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              Select a session to view details
            </span>
          </div>
        ) : loading ? (
          /* Spinner */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "14px",
              color: "var(--color-text-secondary)",
            }}
          >
            <div
              className="qp-spin"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "3px solid var(--color-border)",
                borderTopColor: "var(--color-accent)",
              }}
            />
            <span style={{ fontSize: "13px" }}>Loading session details…</span>
          </div>
        ) : (
          /* Session detail */
          <div>
            {/* Session header */}
            <div style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--color-text)",
                }}
              >
                {selectedSession?.title || "Session Details"}
              </h2>
              {selectedSession && (
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {new Date(selectedSession.started_at).toLocaleString()}
                  </span>
                  {renderStatusBadge(selectedSession.status)}
                </div>
              )}
            </div>

            {/* Summaries section */}
            <section style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Summaries
              </h3>
              {summaries.length === 0 ? (
                <div
                  style={{
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    padding: "22px",
                    textAlign: "center",
                    color: "var(--color-text-tertiary)",
                    fontSize: "13px",
                  }}
                >
                  No summaries available for this session.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {summaries.map((sum) => (
                    <div
                      key={sum.id}
                      style={{
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "10px",
                        padding: "16px",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.65",
                          color: "var(--color-text)",
                        }}
                      >
                        {sum.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Transcripts section */}
            <section>
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Transcripts
              </h3>
              {transcripts.length === 0 ? (
                <div
                  style={{
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    padding: "22px",
                    textAlign: "center",
                    color: "var(--color-text-tertiary)",
                    fontSize: "13px",
                  }}
                >
                  No transcripts available for this session.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {transcripts.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "10px",
                        padding: "14px 16px",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          marginBottom: "6px",
                          color: "var(--color-accent)",
                        }}
                      >
                        Speaker {t.speaker || "Unknown"}
                      </div>
                      <div
                        style={{
                          lineHeight: "1.6",
                          color: "var(--color-text)",
                        }}
                      >
                        {t.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
