"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface SessionWithBlocked {
  blocked?: boolean;
}

export function useBlockedAccountDetection() {
  const { data: session } = useSession();
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (session && (session as SessionWithBlocked).blocked) {
      setIsBlocked(true);
    }
  }, [session]);

  const clearBlocked = () => {
    setIsBlocked(false);
  };

  return { isBlocked, clearBlocked };
}