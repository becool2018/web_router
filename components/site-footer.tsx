import Link from "next/link";

export function SiteFooter() {
  const lastUpdated = new Date();

  return (
    <footer className="border-t border-border bg-card text-sm">
      <div className="text-muted-foreground mx-auto max-w-[1400px] space-y-3 px-3 py-6 sm:px-4">
        <p className="text-foreground font-medium">
          Last updated at{" "}
          <time dateTime={lastUpdated.toISOString()}>
            {lastUpdated.toLocaleString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </time>
        </p>
        <p>
          We receive commissions for products purchased through the links on
          this site through Amazon&apos;s Affiliate Program.
        </p>
        <p>
          Review links point to the original YouTube videos and publisher
          articles. We do not republish full reviews.
        </p>
        <p>Prices do not include shipping or taxes.</p>
        <p>
          <Link href="/faq" className="text-foreground underline underline-offset-2">
            FAQ
          </Link>
        </p>
      </div>
    </footer>
  );
}
