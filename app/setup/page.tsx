import { Suspense } from "react";
import SetupClient from "./SetupClient";

export const metadata = {
  title: "Setup — Timesync",
  robots: { index: false },
};

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-slate-50" />}>
      <SetupClient />
    </Suspense>
  );
}
