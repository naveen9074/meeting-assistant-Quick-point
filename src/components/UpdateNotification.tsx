import { useEffect } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { useUpdater } from "../hooks";

interface UpdateNotificationProps {
  onOpenSettings: () => void;
}

export function UpdateNotification(_props: UpdateNotificationProps) {
  const {
    downloadAndInstall,
  } = useUpdater();

  // Disable update checking - will re-enable after rebranding is complete

  // Emit update status to Rust for tray indicator
  useEffect(() => {
    emit("update-status-changed", { available: false, version: null });
  }, []);

  // Listen for tray install action
  useEffect(() => {
    const unlisten = listen("tray-install-update", () => {
      downloadAndInstall();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [downloadAndInstall]);

  // Never show update notification - disabled until rebranding complete
  return null;
}
