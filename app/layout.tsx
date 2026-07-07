import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import "./globals.css";

// Single display face; body text rides the system sans stack so first paint
// never waits on a webfont. Italic accents are synthesized (no second file).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.justinscocktails.com"),
  title: {
    default: "Justin's Cocktails",
    template: "%s · Justin's Cocktails",
  },
  description:
    "Justin's personal collection of tested cocktail recipes — browse, search, and see what you can make with your own bar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-hairline">
          <div className="mx-auto max-w-6xl px-5 py-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <Link href="/" className="font-serif text-2xl tracking-tight">
              Justin&rsquo;s <span className="italic text-fir">Cocktails</span>
            </Link>
            <Nav />
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-hairline mt-20">
          <div className="mx-auto max-w-6xl px-5 py-8 flex flex-wrap justify-between gap-4 text-sm text-ink-soft">
            <p>
              Recipes &amp; opinions © {new Date().getFullYear()} Justin Nikolaus.
              Drink responsibly.
            </p>
            <p className="font-serif italic">Shaken with intent.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
