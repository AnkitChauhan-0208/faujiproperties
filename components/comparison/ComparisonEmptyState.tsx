import Link from "next/link";

export function ComparisonEmptyState() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-[var(--line)] bg-white px-6 py-10 text-center shadow-[0_12px_28px_rgb(23_43_45_/_6%)] sm:p-12">
      <div
        aria-hidden="true"
        className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#d5e5dc] bg-[#e8f1ed] text-[var(--brand)]"
      >
        <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="7" height="16" rx="1.2" />
          <rect x="14" y="4" width="7" height="16" rx="1.2" />
        </svg>
      </div>
      <p className="eyebrow mt-6">Compare properties</p>
      <h1 className="mt-3 text-3xl font-extrabold text-[var(--brand-dark)]">No properties selected</h1>
      <p className="mt-4 leading-7 text-slate-600">
        Choose up to 3 listings to review the details, price, and features side by side.
      </p>
      <Link href="/properties" className="button-primary mt-7 min-w-44">
        Browse Properties
      </Link>
    </div>
  );
}
