export {};

declare global {
  interface Window {
    Timesync?: {
      open: (opts?: Record<string, unknown>) => void;
      close: () => void;
      bind?: (root?: Document | HTMLElement) => void;
      onBooked?: (payload: unknown) => void;
    };
  }
}
