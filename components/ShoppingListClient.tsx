"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getList,
  toggleListItem,
  removeListItem,
  clearList,
  listAsText,
  onStoreChange,
  type ListItem,
} from "@/lib/store";

export function ShoppingListClient() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sync = () => setItems(getList());
    sync();
    setHydrated(true);
    return onStoreChange(sync);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(listAsText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked; select-and-copy still works from the visible list
    }
  };

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-hairline px-6 py-14 text-center">
        <p className="font-serif text-xl italic">The list is empty.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Add ingredients from any <Link href="/" className="text-fir underline underline-offset-2">recipe page</Link>,
          or let <Link href="/my-bar/" className="text-fir underline underline-offset-2">My Bar</Link> tell
          you which bottles would unlock the most drinks.
        </p>
      </div>
    );
  }

  const remaining = items.filter((i) => !i.checked).length;

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-ink-soft">
          {remaining} of {items.length} still to find
        </p>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="cursor-pointer border border-fir px-3 py-1.5 text-sm text-fir transition-colors hover:bg-fir hover:text-cream"
          >
            {copied ? "Copied ✓" : "Copy as text"}
          </button>
          <button
            type="button"
            onClick={clearList}
            className="cursor-pointer border border-hairline px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-fir hover:text-fir"
          >
            Clear list
          </button>
        </div>
      </div>
      <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
        {items.map((item) => (
          <li key={item.key} className="flex items-start gap-3 py-3">
            <input
              id={`li-${item.key}`}
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleListItem(item.key)}
              className="mt-1 h-4 w-4 cursor-pointer accent-fir"
            />
            <label htmlFor={`li-${item.key}`} className="cursor-pointer">
              <span className={item.checked ? "text-ink-soft line-through" : ""}>
                {item.label}
              </span>
              {item.recipes.length > 0 && (
                <span className="block text-xs text-ink-soft">
                  for {item.recipes.join(", ")}
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={() => removeListItem(item.key)}
              aria-label={`Remove ${item.label}`}
              className="ml-auto cursor-pointer px-2 text-ink-soft transition-colors hover:text-fir"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
