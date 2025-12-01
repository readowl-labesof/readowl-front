"use client";
import { useEffect } from "react";

function getMessageAndName(err: unknown): { message: string; name: string } {
  let message = "";
  let name = "";
  if (typeof err === "string") {
    message = err;
  } else if (typeof err === "object" && err !== null) {
    const e = err as { message?: unknown; name?: unknown };
    if (typeof e.message === "string") message = e.message;
    if (typeof e.name === "string") name = e.name;
  }
  return { message, name };
}

function isChunkLoadError(err: unknown): boolean {
  // Webpack-style chunk load errors often include these markers
  const { message, name } = getMessageAndName(err);
  return (
    name === "ChunkLoadError" ||
    /Loading chunk/i.test(message) ||
    /chunk.*failed/i.test(message)
  );
}

export default function ChunkReload() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event?.error ?? event?.message)) {
        // Soft reload to fetch fresh chunks
        window.location.reload();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason: unknown = event?.reason;
      if (isChunkLoadError(reason)) {
        window.location.reload();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
