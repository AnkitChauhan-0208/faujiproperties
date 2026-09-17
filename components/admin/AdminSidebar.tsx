"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const navigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/properties?add=1", label: "Add Property" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Settings" },
];

const DEFAULT_TIMEOUT_MINUTES = 15;

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timeoutMsRef = { current: DEFAULT_TIMEOUT_MINUTES * 60 * 1000 };
    const lastActivityRef = { current: 0 };
    let loggingOut = false;

    const recordActivity = (timestamp = Date.now()) => {
      lastActivityRef.current = timestamp;
      window.sessionStorage.setItem("admin-last-activity", String(timestamp));
    };
    const onActivity: EventListener = () => recordActivity();

    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        if (!response.ok) {
          window.sessionStorage.removeItem("admin-last-activity");
          window.location.replace("/admin/login");
          return;
        }

        recordActivity();
      } catch {
        window.sessionStorage.removeItem("admin-last-activity");
        window.location.replace("/admin/login");
      }
    };

    const checkInactivity = () => {
      const now = Date.now();
      const lastActivity = lastActivityRef.current || Number(window.sessionStorage.getItem("admin-last-activity") ?? now);
      lastActivityRef.current = lastActivity;
      const elapsedMs = now - lastActivity;

      if (elapsedMs >= timeoutMsRef.current && !loggingOut) {
        loggingOut = true;
        void fetch("/api/admin/logout", { method: "POST" }).finally(() => {
          window.sessionStorage.removeItem("admin-last-activity");
          window.location.replace("/admin/login");
        });
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = ["mousemove", "keydown", "click", "touchstart", "scroll", "pointerdown"];

    void checkSession();
    activityEvents.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));

    const timer = window.setInterval(checkInactivity, 1000);

    const handlePageShow = () => {
      void checkSession();
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, onActivity));
      window.removeEventListener("pageshow", handlePageShow);
      window.clearInterval(timer);
    };
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.sessionStorage.removeItem("admin-last-activity");
    window.location.replace("/admin/login");
  }

  return <aside className="w-full border-b border-[var(--line)] bg-white p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
    <div className="flex items-center justify-between gap-4 md:block"><Link href="/admin" replace className="text-lg font-extrabold text-[var(--brand-dark)]">Fauji Admin</Link><span className="rounded-full bg-[#e8f1ed] px-3 py-1 text-xs font-bold text-[var(--brand)]">Preview</span></div>
    <nav className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-slate-700 md:flex-col" aria-label="Admin navigation">
      {navigation.map((item) => {
        const isAddPropertyLink = item.href === "/admin/properties?add=1";
        const isActive = isAddPropertyLink ? pathname === "/admin/properties" && searchParams.get("add") === "1" : pathname === item.href;

        return (
          <Link key={item.href} href={item.href} replace aria-current={isActive ? "page" : undefined} className={`min-h-12 rounded-lg px-3 py-3 hover:bg-[#f5faf8] hover:text-[var(--brand)] ${isActive ? "bg-[#e8f1ed] text-[var(--brand)]" : ""}`}>
            {item.label}
          </Link>
        );
      })}
      <button type="button" onClick={logout} className="min-h-12 rounded-lg px-3 py-3 text-left font-semibold text-[#9a4034] hover:bg-[#fff6f3]">Logout</button>
    </nav>
  </aside>;
}
