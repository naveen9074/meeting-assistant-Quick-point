use crate::db::get_connection;
use crate::models::auth::{LoginRequest, LoginResponse, RegisterRequest, User};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use uuid::Uuid;

#[tauri::command]
pub async fn register_user(request: RegisterRequest) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    
    // Check if username exists
    let exists: i64 = conn.query_row(
        "SELECT COUNT(*) FROM users WHERE username = ?1 OR email = ?2",
        rusqlite::params![request.username, request.email],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    if exists > 0 {
        return Err("Username or email already exists".to_string());
    }

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let password_hash = hash(&request.password, DEFAULT_COST)
        .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO users (id, username, email, password_hash, role, is_active, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 'user', 0, ?5, ?5)",
        rusqlite::params![id, request.username, request.email, password_hash, now],
    ).map_err(|e| e.to_string())?;

    // Auto-create a pending access request
    let req_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO access_requests (id, user_id, status, created_at) VALUES (?1, ?2, 'pending', ?3)",
        rusqlite::params![req_id, id, now],
    ).map_err(|e| e.to_string())?;

    // Log activity
    let log_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, created_at) VALUES (?1, ?2, 'register', 'user', ?2, ?3)",
        rusqlite::params![log_id, id, now],
    ).map_err(|e| e.to_string())?;

    Ok("Registration successful. Awaiting admin approval.".to_string())
}

#[tauri::command]
pub async fn login_user(request: LoginRequest) -> Result<LoginResponse, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    let row = conn.query_row(
        "SELECT id, username, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE username = ?1",
        rusqlite::params![request.username],
        |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, i64>(5)?,
                row.get::<_, String>(6)?,
                row.get::<_, String>(7)?,
            ))
        },
    ).map_err(|_| "Invalid username or password".to_string())?;

    let (id, username, email, password_hash, role, is_active, created_at, updated_at) = row;

    // Admin can always login; regular users need approval
    if role != "admin" && is_active == 0 {
        return Err("Your account is pending admin approval.".to_string());
    }

    let valid = verify(&request.password, &password_hash)
        .map_err(|e| e.to_string())?;

    if !valid {
        return Err("Invalid username or password".to_string());
    }

    // Create session token
    let token = Uuid::new_v4().to_string();
    let session_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let expires = (Utc::now() + chrono::Duration::hours(24)).to_rfc3339();

    conn.execute(
        "INSERT INTO auth_sessions (id, user_id, token, created_at, expires_at, is_valid) VALUES (?1, ?2, ?3, ?4, ?5, 1)",
        rusqlite::params![session_id, id, token, now, expires],
    ).map_err(|e| e.to_string())?;

    // Log activity
    let log_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, created_at) VALUES (?1, ?2, 'login', 'user', ?2, ?3)",
        rusqlite::params![log_id, id, now],
    ).map_err(|e| e.to_string())?;

    Ok(LoginResponse {
        token,
        user: User { id, username, email, role, is_active: is_active != 0, created_at, updated_at },
    })
}

#[tauri::command]
pub async fn logout_user(token: String) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE auth_sessions SET is_valid = 0 WHERE token = ?1",
        rusqlite::params![token],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn verify_token(token: String) -> Result<User, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    let user = conn.query_row(
        "SELECT u.id, u.username, u.email, u.role, u.is_active, u.created_at, u.updated_at
         FROM auth_sessions s JOIN users u ON s.user_id = u.id
         WHERE s.token = ?1 AND s.is_valid = 1 AND s.expires_at > ?2",
        rusqlite::params![token, now],
        |row| Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            email: row.get(2)?,
            role: row.get(3)?,
            is_active: row.get::<_, i64>(4)? != 0,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        }),
    ).map_err(|_| "Invalid or expired session".to_string())?;

    Ok(user)
}
