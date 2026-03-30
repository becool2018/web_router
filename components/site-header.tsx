import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            <Link href="/" className="hover:underline">
              Router Review Storefront
            </Link>
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-snug sm:text-[13px]">
            Wireless routers with Amazon affiliate buy links, YouTube reviews,
            and third-party review articles in one simple browse page.
          </p>
        </div>
        <div className="flex shrink-0 justify-end">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
