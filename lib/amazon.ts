/**
 * Amazon Associates affiliate links.
 *
 * Set `AMAZON_AFFILIATE_TAG` in your environment once you have a real tag.
 */
export function getAmazonAffiliateTag(): string {
  const configured = process.env.AMAZON_AFFILIATE_TAG?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV !== "production") {
    return "dev-placeholder-20";
  }

  return "";
}

export function amazonLink(asin: string): string {
  const tag = getAmazonAffiliateTag();
  const search = tag ? `?tag=${encodeURIComponent(tag)}` : "";
  return `https://www.amazon.com/dp/${asin}${search}`;
}
