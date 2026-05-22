use crate::db::get_connection;
use crate::models::auth::{AccessRequest, User};
use chrono::Utc;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AccessRequestWithUser {
    pub id: String,
    pub user_id: String,
    pub username: String,
    pub email: String,
    pub request_message: Option<String>,
    pub status: String,
    pub created_at: String,
}

#[tauri::command]
pub async fn admin_get_users() -> Result<Vec<User>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, username, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC"
    ).map_err(|e| e.to_string())?;

    let users = stmt.query_map([], |row| Ok(User {
        id: row.get(0)?,
        username: row.get(1)?,
        email: row.get(2)?,
        role: row.get(3)?,
        is_active: row.get::<_, i64>(4)? != 0,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
    })).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(users)
}

#[tauri::command]
pub async fn admin_get_access_requests() -> Result<Vec<AccessRequestWithUser>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT ar.id, ar.user_id, u.username, u.email, ar.request_message, ar.status, ar.created_at
         FROM access_requests ar JOIN users u ON ar.user_id = u.id
         WHERE ar.status = 'pending' ORDER BY ar.created_at DESC"
    ).map_err(|e| e.to_string())?;

    let requests = stmt.query_map([], |row| Ok(AccessRequestWithUser {
        id: row.get(0)?,
        user_id: row.get(1)?,
        username: row.get(2)?,
        email: row.get(3)?,
        request_message: row.get(4)?,
        status: row.get(5)?,
        created_at: row.get(6)?,
    })).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(requests)
}

#[tauri::command]
pub async fn admin_approve_request(request_id: String, admin_user_id: String) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    // Get user_id from request
    let user_id: String = conn.query_row(
        "SELECT user_id FROM access_requests WHERE id = ?1",
        rusqlite::params![request_id],
        |row| row.get(0),
    ).map_err(|_| "Request not found".to_string())?;

    conn.execute(
        "UPDATE access_requests SET status = 'approved', reviewed_by = ?1, reviewed_at = ?2 WHERE id = ?3",
        rusqlite::params![admin_user_id, now, request_id],
    ).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE users SET is_active = 1, updated_at = ?1 WHERE id = ?2",
        rusqlite::params![now, user_id],
    ).map_err(|e| e.to_string())?;

    let log_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, created_at) VALUES (?1, ?2, 'approve_access', 'access_request', ?3, ?4)",
        rusqlite::params![log_id, admin_user_id, request_id, now],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn admin_reject_request(request_id: String, admin_user_id: String) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE access_requests SET status = 'rejected', reviewed_by = ?1, reviewed_at = ?2 WHERE id = ?3",
        rusqlite::params![admin_user_id, now, request_id],
    ).map_err(|e| e.to_string())?;

    let log_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, created_at) VALUES (?1, ?2, 'reject_access', 'access_request', ?3, ?4)",
        rusqlite::params![log_id, admin_user_id, request_id, now],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn admin_get_system_config() -> Result<Vec<(String, String)>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT key, value FROM system_config ORDER BY key")
        .map_err(|e| e.to_string())?;
    let config = stmt.query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(config)
}

#[tauri::command]
pub async fn admin_set_system_config(key: String, value: String, admin_user_id: String) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO system_config (key, value, updated_by, updated_at) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(key) DO UPDATE SET value = ?2, updated_by = ?3, updated_at = ?4",
        rusqlite::params![key, value, admin_user_id, now],
    ).map_err(|e| e.to_string())?;
    Ok(())
}
