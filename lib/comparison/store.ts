import type { Property } from "@/lib/properties/types";
import {
  COMPARISON_CHANGE_EVENT,
  COMPARISON_MAX,
  COMPARISON_STORAGE_KEY,
  parseComparisonIds,
  readComparisonIds,
  writeComparisonIds,
} from "./storage";

export type ComparisonStatus = "idle" | "loading" | "ready" | "error";

export type ComparisonSnapshot = {
  ids: string[];
  properties: Property[];
  hydrated: boolean;
  status: ComparisonStatus;
  message: string;
};

const emptySnapshot: ComparisonSnapshot = {
  ids: [],
  properties: [],
  hydrated: false,
  status: "idle",
  message: "",
};

let snapshot: ComparisonSnapshot = emptySnapshot;
const listeners = new Set<() => void>();
let clientEnabled = false;
let fetchController: AbortController | null = null;
let messageTimeout: number | null = null;

function emit() {
  listeners.forEach((listener) => listener());
  window.dispatchEvent(new Event(COMPARISON_CHANGE_EVENT));
}

function setSnapshot(next: ComparisonSnapshot) {
  snapshot = next;
  emit();
}

function persist(ids: string[]) {
  writeComparisonIds(ids);
}

function setMessage(message: string) {
  snapshot = { ...snapshot, message };
  emit();

  if (messageTimeout) window.clearTimeout(messageTimeout);
  if (!message) return;

  messageTimeout = window.setTimeout(() => {
    snapshot = { ...snapshot, message: "" };
    emit();
  }, 2600);
}

async function loadProperties(ids: string[]) {
  fetchController?.abort();

  if (!ids.length) {
    setSnapshot({ ...snapshot, ids: [], properties: [], status: "ready" });
    return;
  }

  const controller = new AbortController();
  fetchController = controller;
  setSnapshot({ ...snapshot, ids, status: "loading" });

  try {
    const response = await fetch(`/api/properties?ids=${ids.map(encodeURIComponent).join(",")}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) throw new Error("Unable to load comparison properties.");

    const data = (await response.json()) as { properties?: Property[] };
    const properties = Array.isArray(data.properties) ? data.properties : [];
    const validIds = ids.filter((id) => properties.some((property) => property.id === id));
    const orderedProperties = validIds
      .map((id) => properties.find((property) => property.id === id))
      .filter((property): property is Property => Boolean(property));

    if (validIds.length !== ids.length) persist(validIds);

    setSnapshot({
      ...snapshot,
      ids: validIds,
      properties: orderedProperties,
      status: "ready",
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    setSnapshot({ ...snapshot, ids, properties: [], status: "error" });
  }
}

function hydrate() {
  if (snapshot.hydrated) return;

  const ids = readComparisonIds();
  snapshot = {
    ...snapshot,
    ids,
    hydrated: true,
    status: ids.length ? "loading" : "ready",
  };
  emit();
  void loadProperties(ids);
}

function onStorage(event: StorageEvent) {
  if (event.key !== COMPARISON_STORAGE_KEY && event.key !== null) return;

  const ids = parseComparisonIds(event.newValue);
  snapshot = { ...snapshot, ids, hydrated: true };
  emit();
  void loadProperties(ids);
}

export function enableComparisonStore() {
  if (clientEnabled) return;
  clientEnabled = true;
  hydrate();
}

export function getComparisonSnapshot() {
  if (!clientEnabled) return emptySnapshot;
  return snapshot;
}

export function getServerComparisonSnapshot() {
  return emptySnapshot;
}

export function subscribeComparison(listener: () => void) {
  listeners.add(listener);

  if (listeners.size === 1) {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function addComparisonProperty(property: Property) {
  enableComparisonStore();
  if (snapshot.ids.includes(property.id)) return;

  if (snapshot.ids.length >= COMPARISON_MAX) {
    setMessage("You can compare up to 3 properties.");
    return;
  }

  const ids = [...snapshot.ids, property.id];
  persist(ids);
  setSnapshot({
    ...snapshot,
    ids,
    properties: [...snapshot.properties.filter((item) => item.id !== property.id), property],
    message: "",
    status: "loading",
  });
  void loadProperties(ids);
}

export function removeComparisonProperty(id: string) {
  enableComparisonStore();
  const ids = snapshot.ids.filter((currentId) => currentId !== id);
  persist(ids);
  setSnapshot({
    ...snapshot,
    ids,
    properties: snapshot.properties.filter((property) => property.id !== id),
    status: ids.length ? snapshot.status : "ready",
  });
}

export function toggleComparisonProperty(property: Property) {
  enableComparisonStore();
  if (snapshot.ids.includes(property.id)) {
    removeComparisonProperty(property.id);
    return;
  }
  addComparisonProperty(property);
}

export function clearComparison() {
  enableComparisonStore();
  fetchController?.abort();
  persist([]);
  setSnapshot({
    ...snapshot,
    ids: [],
    properties: [],
    status: "ready",
    message: "",
  });
}

export function refreshComparison() {
  enableComparisonStore();
  void loadProperties(snapshot.ids);
}
