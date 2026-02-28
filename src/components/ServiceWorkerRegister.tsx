"use client";

import { useEffect, useState, useCallback } from "react";

export default function ServiceWorkerRegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );
  const [showUpdate, setShowUpdate] = useState(false);

  const promptUpdate = useCallback((worker: ServiceWorker) => {
    setWaitingWorker(worker);
    setShowUpdate(true);
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setShowUpdate(false);
  }, [waitingWorker]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    let didReload = false;
    const handleControllerChange = () => {
      if (didReload) return;
      didReload = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (registration.waiting) {
          promptUpdate(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              promptUpdate(newWorker);
            }
          });
        });
      })
      .catch(() => {
        // Ignore registration errors silently in production UI.
      });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, [promptUpdate]);

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-(--border) bg-(--surface) px-4 py-3 shadow-xl">
      <div className="flex items-center gap-3">
        <p className="text-sm text-(--text)">New version available</p>
        <button
          onClick={applyUpdate}
          className="rounded-lg bg-(--accent) px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          Update
        </button>
      </div>
    </div>
  );
}
