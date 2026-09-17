"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { PublicBusinessSettings } from "@/lib/settings/service";
import { ComparisonBar } from "./comparison/ComparisonBar";
import { useComparison } from "./comparison/useComparison";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function Header({ settings }: { settings: PublicBusinessSettings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { selectedIds, isHydrated } = useComparison();
  const compareCount = isHydrated ? selectedIds.length : 0;
  const closeMenu = () => setMenuOpen(false);

  function navLabel(href: string, label: string) {
    if (href !== "/compare" || compareCount === 0) return label;
    return `${label} (${compareCount})`;
  }

  return (
    <>
      <header className="border-b border-[var(--line)] bg-white/95 backdrop-blur">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <nav className="site-container flex min-h-20 items-center justify-between gap-4" aria-label="Main navigation">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 text-[var(--brand-dark)]"
            onClick={closeMenu}
          >
            <span aria-hidden="true" className="relative block size-12 shrink-0 overflow-hidden rounded-lg bg-white">
              <img src="/fauji-properties-logo.png" alt="" className="absolute left-1/2 top-0 w-20 max-w-none -translate-x-1/2 -translate-y-2" />
            </span>
            <span className="truncate text-base font-extrabold tracking-tight sm:text-lg">{settings.name}</span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`text-sm font-semibold hover:text-[var(--brand)] ${pathname === item.href ? "text-[var(--brand)]" : "text-slate-600"}`}
              >
                {navLabel(item.href, item.label)}
              </Link>
            ))}
          </div>
          <div className="hidden md:block">
            <Link href="/contact" className="button-primary">
              Enquire Now
            </Link>
          </div>
          <button
            type="button"
            className="flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--brand-dark)] md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Close" : "Open"} menu</span>
            <span aria-hidden="true" className="text-xl leading-none">
              {menuOpen ? "×" : "☰"}
            </span>
          </button>
        </nav>
        {menuOpen ? (
          <div id="mobile-navigation" className="border-t border-[var(--line)] bg-white px-6 pb-5 pt-3 md:hidden">
            <div className="site-container grid gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={closeMenu}
                  className={`min-h-12 rounded-lg px-3 py-3 text-sm font-bold ${pathname === item.href ? "bg-[#e8f1ed] text-[var(--brand)]" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  {navLabel(item.href, item.label)}
                </Link>
              ))}
              <Link href="/contact" onClick={closeMenu} className="button-primary mt-3">
                Enquire Now
              </Link>
            </div>
          </div>
        ) : null}
      </header>
      <ComparisonBar />
    </>
  );
}
