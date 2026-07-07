import Link from "next/link";
import { Glassware } from "@/components/Glassware";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center">
      <Glassware keyName="coupe" className="h-24 w-24 text-ink-soft" />
      <h1 className="mt-6 font-serif text-4xl tracking-tight">Empty glass.</h1>
      <p className="mt-3 max-w-sm text-[15px] text-ink-soft">
        That page doesn&rsquo;t exist — maybe the drink you&rsquo;re after is in the
        collection under a different name.
      </p>
      <Link
        href="/"
        className="mt-6 border border-fir px-5 py-2.5 text-sm text-fir transition-colors hover:bg-fir hover:text-cream"
      >
        Browse all recipes
      </Link>
    </main>
  );
}
