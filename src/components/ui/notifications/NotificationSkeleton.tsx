"use client";
import React from "react";

export default function NotificationSkeleton() {
  return (
    <div className="w-full bg-white border border-readowl-purple/20 rounded-md shadow-sm p-3 mb-3 animate-pulse">
      <div className="grid grid-cols-[72px_1fr_auto] gap-3 items-start">
        <div className="w-[72px] h-[72px] rounded bg-readowl-purple-extralight" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-readowl-purple-extralight/80 rounded" />
          <div className="h-3 w-3/4 bg-readowl-purple-extralight/70 rounded" />
          <div className="h-3 w-2/3 bg-readowl-purple-extralight/60 rounded" />
        </div>
        <div className="h-3 w-16 bg-readowl-purple-extralight/70 rounded self-start" />
      </div>
    </div>
  );
}
