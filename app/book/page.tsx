import { Suspense } from "react";
import BookClient from "./BookClient";

export const metadata = {
  title: "Book a time — Timesync",
};

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-slate-50" />}>
      <BookClient />
    </Suspense>
  );
}
