"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Property } from "@/lib/properties/types";
import { COMPARISON_MAX } from "@/lib/comparison/storage";
import {
  addComparisonProperty,
  clearComparison,
  enableComparisonStore,
  getComparisonSnapshot,
  getServerComparisonSnapshot,
  refreshComparison,
  removeComparisonProperty,
  subscribeComparison,
  toggleComparisonProperty,
} from "@/lib/comparison/store";

const emptyIds: string[] = [];

export function useComparison() {
  const snapshot = useSyncExternalStore(subscribeComparison, getComparisonSnapshot, getServerComparisonSnapshot);

  useEffect(() => {
    enableComparisonStore();
  }, []);

  const selectedIds = snapshot.hydrated ? snapshot.ids : emptyIds;
  const selectedProperties = snapshot.hydrated ? snapshot.properties : [];

  return {
    selectedIds,
    selectedProperties,
    isHydrated: snapshot.hydrated,
    status: snapshot.status,
    message: snapshot.hydrated ? snapshot.message : "",
    isFull: selectedIds.length >= COMPARISON_MAX,
    isSelected: (id: string) => selectedIds.includes(id),
    addProperty: (property: Property) => addComparisonProperty(property),
    removeProperty: (id: string) => removeComparisonProperty(id),
    toggleProperty: (property: Property) => toggleComparisonProperty(property),
    clearAll: () => clearComparison(),
    refresh: () => refreshComparison(),
  };
}
