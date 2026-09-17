"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPrimaryPropertyImage } from "@/lib/properties/types";
import { useComparison } from "./useComparison";

export function ComparisonBar() {
  const pathname = usePathname();
  const { selectedIds, selectedProperties, isHydrated, message, removeProperty, clearAll } = useComparison();

  if (pathname.startsWith("/admin") || !isHydrated) return null;

  if (!selectedIds.length && !message) return null;

  return (
    <>
      {message ? (
        <p
          role="status"
          className="fixed bottom-36 left-1/2 z-50 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg bg-[var(--brand-dark)] px-4 py-3 text-center text-sm font-bold text-white shadow-lg sm:bottom-28"
        >
          {message}
        </p>
      ) : null}

      {selectedIds.length > 0 ? (
        <div
          data-compare-bar
          role="region"
          aria-label="Selected properties to compare"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/98 p-2.5 shadow-[0_-10px_30px_rgb(23_43_45_/_12%)] backdrop-blur sm:p-4"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p aria-live="polite" className="font-extrabold text-[var(--brand-dark)]">
                  Compare properties
                  <span className="ml-2 text-xs font-semibold text-slate-500 sm:text-sm">
                    {selectedIds.length} of 3 selected
                  </span>
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-bold text-slate-500 underline underline-offset-4 hover:text-[var(--brand)]"
                >
                  Clear all
                </button>
              </div>

              <ul className="mt-1.5 flex max-w-full gap-2 overflow-x-auto pb-1">
                {selectedIds.map((id) => {
                  const property = selectedProperties.find((item) => item.id === id);
                  const cover = property ? getPrimaryPropertyImage(property) : undefined;

                  return (
                    <li
                      key={id}
                      className="flex min-w-40 items-center gap-2 rounded-lg border border-[var(--line)] bg-slate-50 py-1.5 pl-1.5 pr-2"
                    >
                      <div className="size-9 shrink-0 overflow-hidden rounded-md bg-slate-200">
                        {cover ? (
                          <img src={cover} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[10px] font-bold uppercase text-slate-400">
                            —
                          </div>
                        )}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-700 sm:text-sm">
                        {property?.title || "Loading property..."}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProperty(id)}
                        aria-label={`Remove ${property?.title || "property"} from comparison`}
                        className="ml-auto inline-flex size-8 items-center justify-center rounded-md text-lg leading-none text-slate-400 hover:bg-white hover:text-[#9a4034]"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {pathname === "/compare" ? (
              <p className="text-sm font-semibold text-slate-500 sm:shrink-0">Review below</p>
            ) : (
              <Link href="/compare" className="button-primary min-h-10 w-full shrink-0 text-sm sm:w-fit">
                Compare Now
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
