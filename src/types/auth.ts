export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AccessRequest {
  id: string;
  user_id: string;
  username: string;
  email: string;
  request_message: string | null;
  status: string;
  created_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  title: string;
  session_type: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
}
