"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button, Spinner, cn } from "@/components/ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/dashboard/users", label: "Users", icon: "👤" },
  { href: "/dashboard/markets", label: "Markets", icon: "📈" },
  { href: "/dashboard/results", label: "Results", icon: "🎯" },
  { href: "/dashboard/deposits", label: "Deposits", icon: "➕" },
  { href: "/dashboard/bids", label: "Bids", icon: "🎲" },
  { href: "/dashboard/withdrawals", label: "Withdrawals", icon: "💸" },
  { href: "/dashboard/audit", label: "Audit Logs", icon: "🛡" },
];

function NavContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn("nav-link", active && "nav-link-active")}
          >
            <span className="w-5 text-center text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, loading, username, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/login");
    }
  }, [loading, authenticated, router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (loading || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="app-bg flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-ink-900/70 lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-glow ring-1 ring-brand-500/20">
            <img src="/logo.jpg" alt="SattaAdmin Logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">
            Satta<span className="text-brand-400">Admin</span>
          </span>
        </div>
        <NavContent pathname={pathname} />
        <div className="border-t border-white/5 p-3">
          <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-slate-500">
            Signed in as
          </div>
          <div className="px-2 pb-3 text-sm font-medium text-slate-200">{username || "admin"}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      >
        <aside
          className={cn(
            "absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col border-r border-white/5 bg-ink-900 transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-glow ring-1 ring-brand-500/20">
                <img src="/logo.jpg" alt="SattaAdmin Logo" className="h-full w-full object-cover" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-100">
                Satta<span className="text-brand-400">Admin</span>
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <NavContent pathname={pathname} onNavigate={() => setOpen(false)} />
          <div className="border-t border-white/5 p-3">
            <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-slate-500">
              Signed in as
            </div>
            <div className="px-2 pb-3 text-sm font-medium text-slate-200">{username || "admin"}</div>
            <Button variant="outline" size="sm" className="w-full" onClick={logout}>
              Logout
            </Button>
          </div>
        </aside>
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/5 bg-ink-900/80 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg lg:hidden shadow-sm ring-1 ring-brand-500/20">
              <img src="/logo.jpg" alt="SattaAdmin Logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-sm font-semibold text-slate-200">
              {NAV.find((n) =>
                n.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(n.href)
              )?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {username || "admin"}
            </span>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
