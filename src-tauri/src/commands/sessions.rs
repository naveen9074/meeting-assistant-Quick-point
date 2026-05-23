use crate::db::get_connection;
use chrono::Utc;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct InterviewSession {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub session_type: String,
    pub status: String,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub notes: Option<String>,
}

#[tauri::command]
pub async fn create_session(user_id: String, title: String, session_type: String) -> Result<InterviewSession, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO interview_sessions (id, user_id, title, session_type, status, started_at) VALUES (?1, ?2, ?3, ?4, 'active', ?5)",
        rusqlite::params![id, user_id, title, session_type, now],
    ).map_err(|e| e.to_string())?;

    Ok(InterviewSession {
        id,
        user_id,
        title,
        session_type,
        status: "active".to_string(),
        started_at: now,
        ended_at: None,
        notes: None,
    })
}

#[tauri::command]
pub async fn get_user_sessions(user_id: String) -> Result<Vec<InterviewSession>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, user_id, title, session_type, status, started_at, ended_at, notes FROM interview_sessions WHERE user_id = ?1 ORDER BY started_at DESC"
    ).map_err(|e| e.to_string())?;

    let sessions = stmt.query_map(rusqlite::params![user_id], |row| Ok(InterviewSession {
        id: row.get(0)?,
        user_id: row.get(1)?,
        title: row.get(2)?,
        session_type: row.get(3)?,
        status: row.get(4)?,
        started_at: row.get(5)?,
        ended_at: row.get(6)?,
        notes: row.get(7)?,
    })).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(sessions)
}

#[tauri::command]
pub async fn end_session(session_id: String) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE interview_sessions SET status = 'completed', ended_at = ?1 WHERE id = ?2",
        rusqlite::params![now, session_id],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn admin_get_all_sessions() -> Result<Vec<InterviewSession>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, user_id, title, session_type, status, started_at, ended_at, notes FROM interview_sessions ORDER BY started_at DESC"
    ).map_err(|e| e.to_string())?;

    let sessions = stmt.query_map([], |row| Ok(InterviewSession {
        id: row.get(0)?,
        user_id: row.get(1)?,
        title: row.get(2)?,
        session_type: row.get(3)?,
        status: row.get(4)?,
        started_at: row.get(5)?,
        ended_at: row.get(6)?,
        notes: row.get(7)?,
    })).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(sessions)
}

#[tauri::command]
pub async fn log_export(
    user_id: Option<String>,
    session_id: Option<String>,
    export_format: String,
    file_path: Option<String>,
) -> Result<(), String> {
    let user_id = match user_id {
        Some(uid) if !uid.trim().is_empty() => uid,
        _ => return Err("User ID is required for logging exports".into()),
    };

    let conn = get_connection().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO export_logs (id, user_id, session_id, export_format, file_path, exported_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![id, user_id, session_id, export_format, file_path, now],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionTranscript {
    pub id: String,
    pub session_id: String,
    pub audio_segment_id: Option<String>,
    pub text: String,
    pub language: Option<String>,
    pub created_at: String,
    pub speaker: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionSummary {
    pub id: String,
    pub session_id: String,
    pub transcript_id: Option<String>,
    pub content: String,
    pub model_used: Option<String>,
    pub created_at: String,
}

#[tauri::command]
pub async fn get_session_transcripts(session_id: String) -> Result<Vec<SessionTranscript>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, session_id, audio_segment_id, content, language, created_at FROM interview_transcripts WHERE session_id = ?1 ORDER BY created_at ASC"
    ).map_err(|e| e.to_string())?;

    let transcripts = stmt.query_map(rusqlite::params![session_id], |row| Ok(SessionTranscript {
        id: row.get(0)?,
        session_id: row.get(1)?,
        audio_segment_id: row.get(2)?,
        text: row.get(3)?,
        language: row.get(4)?,
        created_at: row.get(5)?,
        speaker: None,
    })).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(transcripts)
}

#[tauri::command]
pub async fn get_session_summaries(session_id: String) -> Result<Vec<SessionSummary>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, session_id, transcript_id, content, model_used, created_at FROM interview_summaries WHERE session_id = ?1 ORDER BY created_at DESC"
    ).map_err(|e| e.to_string())?;

    let summaries = stmt.query_map(rusqlite::params![session_id], |row| Ok(SessionSummary {
        id: row.get(0)?,
        session_id: row.get(1)?,
        transcript_id: row.get(2)?,
        content: row.get(3)?,
        model_used: row.get(4)?,
        created_at: row.get(5)?,
    })).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(summaries)
}


