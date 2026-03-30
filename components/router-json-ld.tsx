import { amazonLink } from "@/lib/amazon";
import { PRODUCTS } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site-url";

export function RouterJsonLd() {
  const base = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Router Review Storefront",
    description:
      "Wireless router storefront with Amazon affiliate buy links, YouTube reviews, and article reviews.",
    numberOfItems: PRODUCTS.length,
    itemListElement: PRODUCTS.map((r, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: `${r.brand} ${r.model}`,
        sku: r.asin,
        brand: {
          "@type": "Brand",
          name: r.brand,
        },
        ...(r.thumbnailUrl
          ? {
              image: r.thumbnailUrl.startsWith("http")
                ? r.thumbnailUrl
                : `${base}${r.thumbnailUrl}`,
            }
          : {}),
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: r.price,
          url: amazonLink(r.asin),
          availability: "https://schema.org/InStock",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: r.customerReviewRating,
          bestRating: 5,
          worstRating: 1,
        },
        subjectOf: [
          ...r.reviewCollection.youtubeReviews,
          ...r.reviewCollection.articleReviews,
        ].map((review) => ({
          "@type": "Review",
          name: review.title,
          publisher: {
            "@type": "Organization",
            name: review.sourceName,
          },
          url: review.url,
        })),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a string; data is static and from our own module.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
