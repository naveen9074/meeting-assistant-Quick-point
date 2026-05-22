# QuickPoint
### AI Interview & Meeting Assistant

Local-first desktop app for capturing, transcribing, and summarizing interviews and meetings.
Built with Tauri v2, React 18, TypeScript, Tailwind CSS, Zustand, SQLite, Whisper, and Ollama.

## Features
- Audio recording and upload
- Local Whisper transcription (no cloud)
- Local Ollama AI summary generation (no cloud)
- Interview / meeting session management
- Admin and User role system
- User access request and approval flow
- Export transcripts and summaries
- Search across notes and transcripts

## Default Login
| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |

## Stack
- Frontend: React 18, TypeScript, Tailwind CSS, Zustand
- Backend: Tauri v2, Rust, rusqlite (SQLite)
- AI: Whisper (local transcription), Ollama (local LLM)

## Setup
```bash
npm install
npm run tauri dev
```
