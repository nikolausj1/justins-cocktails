"use client";

/** localStorage-backed state for My Bar and the shopping list. No backend. */

export interface ListItem {
  key: string; // canonical id or normalized raw line
  label: string;
  checked: boolean;
  recipes: string[];
}

const BAR_KEY = "jc.mybar.v1";
const LIST_KEY = "jc.list.v1";
const EVT = "jc-store-change";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
  } catch {
    // storage full or blocked; state stays in-memory for the session
  }
}

export function onStoreChange(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

/* ---------- My Bar ---------- */

export const getBar = (): string[] => read<string[]>(BAR_KEY, []);

export function toggleBarItem(id: string) {
  const bar = new Set(getBar());
  if (bar.has(id)) bar.delete(id);
  else bar.add(id);
  write(BAR_KEY, [...bar]);
}

export const clearBar = () => write(BAR_KEY, []);

/* ---------- Shopping list ---------- */

export const getList = (): ListItem[] => read<ListItem[]>(LIST_KEY, []);

export function addToList(items: { key: string; label: string; recipe?: string }[]) {
  const list = getList();
  for (const { key, label, recipe } of items) {
    const existing = list.find((i) => i.key === key);
    if (existing) {
      if (recipe && !existing.recipes.includes(recipe)) existing.recipes.push(recipe);
    } else {
      list.push({ key, label, checked: false, recipes: recipe ? [recipe] : [] });
    }
  }
  write(LIST_KEY, list);
}

export function toggleListItem(key: string) {
  const list = getList();
  const item = list.find((i) => i.key === key);
  if (item) item.checked = !item.checked;
  write(LIST_KEY, list);
}

export function removeListItem(key: string) {
  write(LIST_KEY, getList().filter((i) => i.key !== key));
}

export const clearList = () => write(LIST_KEY, []);

export function listAsText(): string {
  return getList()
    .map((i) => `${i.checked ? "[x]" : "[ ]"} ${i.label}`)
    .join("\n");
}
