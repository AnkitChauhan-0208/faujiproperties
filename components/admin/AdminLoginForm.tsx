"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, rememberMe }) });
      if (!response.ok) {
        setError("Invalid admin credentials");
        return;
      }
      const nextPath = searchParams.get("next");
      const destination = nextPath?.startsWith("/admin") && !nextPath.startsWith("//") ? nextPath : "/admin";
      window.location.replace(destination);
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_18px_44px_rgb(23_43_45_/_10%)]"><div><label htmlFor="admin-email" className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Admin ID / Email</label><input id="admin-email" name="email" type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-[var(--line)] px-3 text-slate-700 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#d9e8e3]" /></div><div><label htmlFor="admin-password" className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Password</label><div className="mt-2 flex rounded-lg border border-[var(--line)] focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[#d9e8e3]"><input id="admin-password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 min-w-0 flex-1 rounded-l-lg px-3 text-slate-700 outline-none" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="min-h-12 rounded-r-lg px-3 text-sm font-bold text-[var(--brand)]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></div><label className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-dark)]"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="size-4" />Remember me</label>{error && <p role="alert" className="rounded-lg border border-[#e4c7c1] bg-[#fff6f3] px-3 py-3 text-sm font-semibold text-[#9a4034]">{error}</p>}<button type="submit" disabled={loading} className="button-primary w-full disabled:cursor-wait disabled:opacity-70">{loading ? "Signing in..." : "Login"}</button></form>;
}
