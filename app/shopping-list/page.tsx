import type { Metadata } from "next";
import { ShoppingListClient } from "@/components/ShoppingListClient";

export const metadata: Metadata = {
  title: "Shopping List",
  description: "Your consolidated ingredient list for Justin's cocktail recipes.",
};

export default function ShoppingListPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl tracking-tight">Shopping List</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Everything you&rsquo;ve queued up from recipes and My Bar, consolidated for the
          store. Lives in your browser only.
        </p>
      </div>
      <div className="mt-8">
        <ShoppingListClient />
      </div>
    </main>
  );
}
