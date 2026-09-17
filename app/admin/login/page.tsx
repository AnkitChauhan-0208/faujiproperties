import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Admin Login | Fauji Properties", description: "Sign in to the Fauji Properties administration panel." };

export default function AdminLoginPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(145deg,#e6f0ec,#f9f3e8)] px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="mx-auto flex w-fit items-center gap-3 text-lg font-extrabold tracking-tight text-[var(--brand-dark)]"><span aria-hidden="true" className="relative block size-12 shrink-0 overflow-hidden rounded-lg bg-white"><img src="/fauji-properties-logo.png" alt="" className="absolute left-1/2 top-0 w-20 max-w-none -translate-x-1/2 -translate-y-2" /></span>Fauji Properties</Link><div className="mt-8"><p className="eyebrow text-center">Private area</p><h1 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-[var(--brand-dark)]">Admin Login</h1><p className="mt-3 text-center text-sm text-[var(--muted)]">Sign in to manage your property listings.</p><div className="mt-7"><AdminLoginForm /></div></div></div></main>;
}
