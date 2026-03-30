import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "FAQ – Router Review Storefront",
  description:
    "Frequently asked questions about Router Review Storefront, Amazon affiliate links, and review sources.",
};

export default function FaqPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-8 sm:px-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Frequently Asked Questions
        </h1>

        <div className="mt-8 space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-foreground text-base font-semibold">
              Where do the product details come from?
            </h2>
            <p className="text-muted-foreground mt-2">
              This first version uses a local product catalog for router specs,
              pricing placeholders, and review links. The site is designed so a
              future ingestion script can refresh review metadata without
              changing the storefront structure.
            </p>
          </section>

          <section>
            <h2 className="text-foreground text-base font-semibold">
              How often is this site updated?
            </h2>
            <p className="text-muted-foreground mt-2">
              Product and review data can be refreshed whenever you rerun the
              ingestion script. The storefront shows a per-product review
              refresh date when available.
            </p>
          </section>

          <section>
            <h2 className="text-foreground text-base font-semibold">
              How do the review links work?
            </h2>
            <p className="text-muted-foreground mt-2">
              Each router can show YouTube review videos and article links from
              third-party publishers. We link out to the original source rather
              than copying full reviews onto this site.
            </p>
          </section>

          <section>
            <h2 className="text-foreground text-base font-semibold">
              Can I expand this to other products later?
            </h2>
            <p className="text-muted-foreground mt-2">
              Yes. The new review data model is shaped so routers are just the
              first category. If this works, you can add more product types and
              reuse the same review-link sections and affiliate-link flow.
            </p>
          </section>

          <section>
            <h2 className="text-foreground text-base font-semibold">
              Can you add more filters and sorting later?
            </h2>
            <p className="text-muted-foreground mt-2">
              Yes. The current storefront keeps the existing router filters so
              shoppers can narrow by WiFi generation, price, router type,
              security support, and more.
            </p>
          </section>

          <section>
            <h2 className="text-foreground text-base font-semibold">
              Why keep the first version simple?
            </h2>
            <p className="text-muted-foreground mt-2">
              A single-page storefront is easier to launch, maintain, and learn
              from. Once you know people use it, you can add category pages,
              dedicated product pages, or deeper automation with much less risk.
            </p>
          </section>

          <section>
            <h2 className="text-foreground text-base font-semibold">
              Why shouldn&apos;t I buy the cheapest router?
            </h2>
            <p className="text-muted-foreground mt-2">
              Pricing reflects warranty duration, intended market, radio
              performance, firmware quality, mesh vs. single-router design, and
              inventory levels. The &quot;value&quot; column is a rough dollars
              per claimed coverage heuristic — use it as a starting point, not
              the only signal.
            </p>
          </section>

          <section>
            <h2 className="text-foreground text-base font-semibold">
              What about shipping?
            </h2>
            <p className="text-muted-foreground mt-2">
              The prices listed here don&apos;t include shipping and taxes, as
              we don&apos;t know where you live. The majority of these listings
              include free shipping, especially if you have{" "}
              <a
                href="https://www.amazon.com/amazonprime"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Amazon Prime
              </a>{" "}
              but make sure to check shipping costs before placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-foreground text-base font-semibold">
              Is this an ad?
            </h2>
            <p className="text-muted-foreground mt-2">
              We receive commissions for products purchased through the links
              on this site through{" "}
              <a
                href="https://affiliate-program.amazon.com/"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Amazon&apos;s Affiliate Program
              </a>
              .
            </p>
          </section>

          <p className="text-muted-foreground pt-4">
            <Link href="/" className="text-foreground underline underline-offset-2">
              ← Back to the storefront
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
