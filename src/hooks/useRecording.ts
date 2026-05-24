import { useCallback, useEffect, useRef, useState } from "react";
import { audioApi } from "../api";
import { RecordingPhase } from "../types";
import { useSessionStore } from "../store/useSessionStore";

interface UseRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingPhase: RecordingPhase;
  audioLevel: number;
  audioPath: string | null;
  error: string | null;
  isDualRecording: boolean;
  startRecording: (noteId: string) => Promise<void>;
  stopRecording: (noteId?: string) => Promise<string | null>;
  pauseRecording: () => Promise<void>;
  resumeRecording: (noteId: string) => Promise<void>;
  continueRecording: (noteId: string) => Promise<void>;
}

export function useRecording(): UseRecordingReturn {
  const { activeSessionId } = useSessionStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingPhase, setRecordingPhase] = useState<RecordingPhase>(
    RecordingPhase.Idle
  );
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // isDualRecording is kept for future dual-recording support but always false now
  const [isDualRecording] = useState(false);
  const levelIntervalRef = useRef<number | null>(null);
  const currentNoteIdRef = useRef<string | null>(null);

  // ─── Start Recording (mic-only for stable cross-platform behavior) ───────────
  const startRecording = useCallback(
    async (noteId: string) => {
      try {
        setError(null);
        currentNoteIdRef.current = noteId;

        // Always use mic-only recording.
        // System audio (WASAPI/loopback) on Windows reports as "supported + permitted"
        // even with no audio playing, which produces empty WAV files and breaks
        // transcription. Mic-only is reliable on all platforms.
        console.log(
          "[useRecording] Starting mic-only recording for note:",
          noteId
        );
        const path = await audioApi.startRecording(noteId, activeSessionId);
        setAudioPath(path);
        setIsRecording(true);
        setRecordingPhase(RecordingPhase.Recording);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [activeSessionId]
  );

  // ─── Stop Recording ──────────────────────────────────────────────────────────
  const stopRecording = useCallback(
    async (_noteId?: string): Promise<string | null> => {
      try {
        setError(null);

        // Mic-only stop
        console.log("[useRecording] Stopping mic-only recording");
        const path = await audioApi.stopRecording();

        setAudioPath(path ?? null);
        setIsRecording(false);
        setIsPaused(false);
        setRecordingPhase(RecordingPhase.Idle);
        setAudioLevel(0);
        currentNoteIdRef.current = null;
        return path ?? null;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return null;
      }
    },
    []
  );

  // ─── Pause Recording ─────────────────────────────────────────────────────────
  const pauseRecording = useCallback(async () => {
    try {
      setError(null);
      console.log("[useRecording] Pausing mic recording");
      await audioApi.pauseRecordingCmd();
      setIsRecording(false);
      setIsPaused(true);
      setRecordingPhase(RecordingPhase.Paused);
      setAudioLevel(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // ─── Resume Recording ────────────────────────────────────────────────────────
  const resumeRecording = useCallback(async (noteId: string) => {
    try {
      setError(null);
      console.log("[useRecording] Resuming mic recording for note:", noteId);
      const path = await audioApi.resumeRecordingCmd(noteId);
      setAudioPath(path);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingPhase(RecordingPhase.Recording);
      currentNoteIdRef.current = noteId;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // ─── Continue Recording on an Ended Note ────────────────────────────────────
  const continueRecording = useCallback(
    async (noteId: string) => {
      try {
        setError(null);
        console.log(
          "[useRecording] Continuing recording on ended note:",
          noteId
        );
        // Start a new mic-only segment on the same note
        const path = await audioApi.startRecordingSegment(
          noteId,
          activeSessionId
        );
        setAudioPath(path);
        setIsRecording(true);
        setIsPaused(false);
        setRecordingPhase(RecordingPhase.Recording);
        currentNoteIdRef.current = noteId;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [activeSessionId]
  );

  // ─── Poll audio level while recording ───────────────────────────────────────
  useEffect(() => {
    if (isRecording) {
      levelIntervalRef.current = window.setInterval(async () => {
        try {
          const level = await audioApi.getAudioLevel();
          setAudioLevel(level);
        } catch {
          // Ignore polling errors
        }
      }, 100);
    } else {
      if (levelIntervalRef.current) {
        clearInterval(levelIntervalRef.current);
        levelIntervalRef.current = null;
      }
    }

    return () => {
      if (levelIntervalRef.current) {
        clearInterval(levelIntervalRef.current);
      }
    };
  }, [isRecording]);

  // ─── Sync initial recording status on mount ──────────────────────────────────
  useEffect(() => {
    audioApi.getRecordingStatus().then(setIsRecording).catch(console.error);
  }, []);

  return {
    isRecording,
    isPaused,
    recordingPhase,
    audioLevel,
    audioPath,
    error,
    isDualRecording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    continueRecording,
  };
}
