import type { Metadata } from "next";
import "clico-ds/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Timesync — Book time on my calendar",
  description:
    "A neo-brutalist, Calendly-style scheduling widget wired to Google Calendar. Embed a booking modal in any app, or share a link.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_TIMESYNC_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Timesync — Book time on my calendar",
    description: "Pick a time, get a Google Meet link. Embeddable anywhere.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
