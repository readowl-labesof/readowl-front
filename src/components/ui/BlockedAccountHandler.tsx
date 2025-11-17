"use client";
import { useBlockedAccountDetection } from "@/lib/hooks/useBlockedAccountDetection";
import BlockedAccountModal from "@/components/ui/modal/BlockedAccountModal";

export default function BlockedAccountHandler() {
  const { isBlocked, clearBlocked } = useBlockedAccountDetection();

  return (
    <BlockedAccountModal 
      isOpen={isBlocked} 
      onClose={clearBlocked} 
    />
  );
}