"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Recipes" },
  { href: "/my-bar/", label: "My Bar" },
  { href: "/shopping-list/", label: "Shopping List" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-6 text-sm">
      {LINKS.map(({ href, label }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));
        return (
          <Link
            key={href}
            href={href}
            className={`border-b pb-0.5 transition-colors ${
              active
                ? "border-fir text-fir"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
