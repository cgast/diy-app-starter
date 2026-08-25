import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Self-Developing App Starter",
  description: "A blank app, a kanban board, and an agent that builds it.",
};

const NAV = [
  { href: "/", label: "App (user)" },
  { href: "/admin", label: "Admin" },
  { href: "/kanban", label: "Kanban (maintainer)" },
  { href: "/agents", label: "Agents" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0d12] text-[#e6e8ee]">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/10">
            <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4 text-sm">
              <span className="font-semibold tracking-tight text-white">
                self-dev-app-starter
              </span>
              <div className="flex gap-4">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-white/70 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
