import { useSyncExternalStore } from "react";

// Browser-only values are read via useSyncExternalStore so they are SSR-safe
// (no hydration mismatch) without a setState-in-effect.

const noopSubscribe = () => () => {};

export function useOrigin(fallback = ""): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => fallback,
  );
}

export function useBookerTimeZone(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    () => "",
  );
}
