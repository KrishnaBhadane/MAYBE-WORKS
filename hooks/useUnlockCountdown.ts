"use client";

import { useState, useEffect, useRef } from "react";
import { formatTimeRemaining, type TimeRemaining } from "@/lib/utils/unlockCalculator";

const INITIAL_STATE: TimeRemaining = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  formatted: "00:00:00",
  isUnlocked: true,
  totalMs: 0,
};

export function useUnlockCountdown(
  unlockTime?: string | null,
  onUnlock?: () => void
): TimeRemaining {
  const [prevUnlockTime, setPrevUnlockTime] = useState(unlockTime);
  const [countdown, setCountdown] = useState<TimeRemaining>(() => {
    if (!unlockTime) return INITIAL_STATE;
    return formatTimeRemaining(unlockTime);
  });

  // Adjust state during render if unlockTime prop changes
  if (prevUnlockTime !== unlockTime) {
    setPrevUnlockTime(unlockTime);
    setCountdown(!unlockTime ? INITIAL_STATE : formatTimeRemaining(unlockTime));
  }

  const onUnlockRef = useRef(onUnlock);
  useEffect(() => {
    onUnlockRef.current = onUnlock;
  }, [onUnlock]);

  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!unlockTime) return;

    hasFiredRef.current = false;
    const initial = formatTimeRemaining(unlockTime);

    if (initial.isUnlocked) {
      if (!hasFiredRef.current) {
        hasFiredRef.current = true;
        onUnlockRef.current?.();
      }
      return;
    }

    // 1000ms high-precision interval
    const intervalId = setInterval(() => {
      const next = formatTimeRemaining(unlockTime);

      setCountdown((prev) => {
        // Prevent re-renders unless formatted string or unlock state actually changes
        if (prev.formatted === next.formatted && prev.isUnlocked === next.isUnlocked) {
          return prev;
        }
        return next;
      });

      if (next.isUnlocked && !hasFiredRef.current) {
        hasFiredRef.current = true;
        clearInterval(intervalId);
        onUnlockRef.current?.();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [unlockTime]);

  return countdown;
}
