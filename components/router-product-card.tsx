import { ExternalLink, Newspaper, PlayCircle, Star } from "lucide-react";

import { RouterThumbnail } from "@/components/router-thumbnail";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { amazonLink } from "@/lib/amazon";
import { formatMbps, formatValueScore, valueScorePer1kSqFt } from "@/lib/routers";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/catalog";
import type { ReviewLink } from "@/lib/reviews";

function formatDate(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ReviewList({
  heading,
  icon,
  reviews,
  emptyState,
}: {
  heading: string;
  icon: React.ReactNode;
  reviews: ReviewLink[];
  emptyState: string;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-background/80 p-4">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-semibold tracking-tight">{heading}</h3>
      </div>

      {reviews.length ? (
        <div className="space-y-2.5">
          {reviews.map((review) => {
            const published = formatDate(review.publishedAt);

            return (
              <a
                key={`${heading}-${review.url}`}
                href={review.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group block rounded-xl border border-border bg-card px-3 py-3 transition hover:border-primary/35 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-foreground group-hover:text-primary">
                      {review.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {review.sourceName}
                      {published ? ` • ${published}` : ""}
                    </p>
                  </div>
                  <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </div>
                {review.summarySnippet ? (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {review.summarySnippet}
                  </p>
                ) : null}
              </a>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyState}</p>
      )}
    </section>
  );
}

function CustomerReviewStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center gap-px"
        role="img"
        aria-label={`${rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn(
              "size-3.5 shrink-0",
              index < rating
                ? "fill-amber-400 text-amber-500"
                : "fill-transparent text-muted-foreground/35"
            )}
            aria-hidden
          />
        ))}
      </span>
      <span className="text-xs font-mono tabular-nums text-muted-foreground">
        {rating}/5
      </span>
    </span>
  );
}

export function RouterProductCard({ product }: { product: Product }) {
  const reviewCount =
    product.reviewCollection.youtubeReviews.length +
    product.reviewCollection.articleReviews.length;
  const lastReviewedAt = formatDate(product.reviewCollection.lastReviewedAt);

  return (
    <article className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-linear-to-r from-primary/[0.06] via-background to-background px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <RouterThumbnail
              alt={product.model}
              src={product.thumbnailUrl}
              className="size-16 rounded-2xl"
            />
            <div className="min-w-0 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {product.brand}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                  {product.model}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{product.wifi}</Badge>
                  <Badge variant="outline">{product.routerType}</Badge>
                  <Badge variant="outline">{product.frequencyBandClass}</Badge>
                  <Badge variant="outline">{reviewCount} review links</Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <CustomerReviewStars rating={product.customerReviewRating} />
                <span>{product.coverage} sq ft</span>
                <span>{product.devices} devices</span>
                <span>{product.speed} Gbps class</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/80 p-4 lg:w-[290px]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Buy on Amazon
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(product.price)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Affiliate link. We may earn a commission if you buy through this button.
            </p>
            <a
              href={amazonLink(product.asin)}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "mt-4 w-full justify-center font-semibold"
              )}
            >
              Buy on Amazon
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Performance
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Download</dt>
                  <dd className="font-medium">{formatMbps(product.maxDownloadMbps)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Upload</dt>
                  <dd className="font-medium">{formatMbps(product.maxUploadMbps)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Value score</dt>
                  <dd className="font-medium">
                    {formatValueScore(valueScorePer1kSqFt(product))}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-background/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Security
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.securityProtocols.map((protocol) => (
                  <Badge key={protocol} variant="outline">
                    {protocol}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/80 p-4 sm:col-span-2 xl:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Highlights
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.specialFeatures.slice(0, 6).map((feature) => (
                  <Badge key={feature} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <ReviewList
            heading="YouTube Reviews"
            icon={<PlayCircle className="size-4" />}
            reviews={product.reviewCollection.youtubeReviews}
            emptyState="No YouTube reviews are attached to this router yet."
          />
        </section>

        <section className="space-y-4">
          <ReviewList
            heading="Article Reviews"
            icon={<Newspaper className="size-4" />}
            reviews={product.reviewCollection.articleReviews}
            emptyState="No third-party article reviews are attached to this router yet."
          />

          <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            {lastReviewedAt
              ? `Review links last refreshed ${lastReviewedAt}.`
              : "Review links have not been refreshed yet."}{" "}
            Article links are publisher pages, not copied review text.
          </div>
        </section>
      </div>
    </article>
  );
}
