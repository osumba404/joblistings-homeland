import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homeland Jobs — Find Work. Hire Talent.",
  description:
    "Kenya's premier freelance job marketplace connecting top talent with employers across East Africa.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
