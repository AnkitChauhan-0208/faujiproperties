"use client";

import type { Property } from "@/lib/properties/types";
import { useComparison } from "./useComparison";

export function CompareButton({ property }: { property: Property }) {
  const { isHydrated, isSelected, isFull, toggleProperty } = useComparison();
  const selected = isSelected(property.id);
  const atCapacity = isHydrated && isFull && !selected;

  const label = selected ? "Added" : atCapacity ? "Maximum 3 reached" : "Add to Compare";
  const ariaLabel = selected
    ? `Remove ${property.title} from comparison`
    : atCapacity
      ? `Cannot add ${property.title} to comparison. Maximum of 3 properties reached.`
      : `Add ${property.title} to comparison`;

  return (
    <button
      type="button"
      onClick={() => toggleProperty(property)}
      disabled={atCapacity}
      aria-pressed={selected}
      aria-label={ariaLabel}
      title={atCapacity ? "You can compare up to 3 properties" : ariaLabel}
      className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-75 ${
        selected
          ? "border-[var(--brand)] bg-[#e8f1ed] text-[var(--brand-dark)] shadow-[inset_0_0_0_1px_rgb(31_77_78_/_8%)]"
          : atCapacity
            ? "border-[#ecd6b4] bg-[#fff9ed] text-[#875b20]"
            : "border-[var(--line)] bg-white text-slate-600 hover:border-[var(--brand)] hover:text-[var(--brand)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex size-4 items-center justify-center rounded border text-[10px] ${
          selected ? "border-[var(--brand)] bg-[var(--brand)] text-white" : atCapacity ? "border-[#ba8240]" : "border-slate-400"
        }`}
      >
        {selected ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}
