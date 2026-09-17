"use client";

import { useSyncExternalStore } from "react";

const savedPropertiesKey = "fauji-properties:saved";

type SavePropertyButtonProps = {
  propertyId: string;
  compact?: boolean;
};

function readSavedProperties() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(savedPropertiesKey) ?? "[]");
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function SavePropertyButton({ propertyId, compact = false }: SavePropertyButtonProps) {
  const saved = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("saved-properties-change", onStoreChange);
      return () => window.removeEventListener("saved-properties-change", onStoreChange);
    },
    () => readSavedProperties().includes(propertyId),
    () => false,
  );

  function toggleSaved() {
    const savedProperties = readSavedProperties();
    const nextSaved = savedProperties.includes(propertyId)
      ? savedProperties.filter((id) => id !== propertyId)
      : [...savedProperties, propertyId];

    window.localStorage.setItem(savedPropertiesKey, JSON.stringify(nextSaved));
    window.dispatchEvent(new Event("saved-properties-change"));
  }

  return <button type="button" onClick={toggleSaved} aria-pressed={saved} aria-label={saved ? "Remove property from saved properties" : "Save property"} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold transition ${saved ? "border-[var(--brand)] bg-[#e8f1ed] text-[var(--brand)]" : "border-[var(--line)] bg-white text-[var(--brand-dark)] hover:border-[var(--brand)]"}`}>
    <span aria-hidden="true" className="text-lg leading-none">{saved ? "★" : "☆"}</span>
    {!compact && (saved ? "Saved" : "Save property")}
  </button>;
}
