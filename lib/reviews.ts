export type ReviewKind = "youtube" | "article";

export type ReviewLink = {
  kind: ReviewKind;
  title: string;
  url: string;
  sourceName: string;
  publishedAt?: string;
  thumbnailUrl?: string;
  summarySnippet?: string;
  score?: number;
};

export type ReviewCollection = {
  youtubeReviews: ReviewLink[];
  articleReviews: ReviewLink[];
  lastReviewedAt?: string;
  manualExcludedUrls?: string[];
};

export type ReviewSearchConfig = {
  articleLimit: number;
  youtubeLimit: number;
  allowedArticleDomains: string[];
};

export const DEFAULT_REVIEW_SEARCH_CONFIG: ReviewSearchConfig = {
  articleLimit: 3,
  youtubeLimit: 3,
  allowedArticleDomains: [
    "cnet.com",
    "dongknows.com",
    "expertreviews.co.uk",
    "lifewire.com",
    "nytimes.com",
    "pcmag.com",
    "rtings.com",
    "techradar.com",
    "theverge.com",
    "tomsguide.com",
    "trustedreviews.com",
    "wirecutter.com",
    "zdnet.com",
  ],
};

const EXCLUDED_HOST_FRAGMENTS = [
  "amazon.",
  "bestbuy.",
  "ebay.",
  "facebook.com",
  "instagram.com",
  "reddit.com",
  "tiktok.com",
  "walmart.com",
];

const REVIEW_HINTS = [
  "review",
  "hands on",
  "hands-on",
  "tested",
  "verdict",
  "worth it",
  "vs",
];

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function normalizeReviewUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) {
        return `https://www.youtube.com/watch?v=${id}`;
      }
    }

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.replace(/\//g, "");
      if (id) {
        return `https://www.youtube.com/watch?v=${id}`;
      }
    }

    parsed.search = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

export function isAllowedArticleUrl(
  url: string,
  allowedDomains = DEFAULT_REVIEW_SEARCH_CONFIG.allowedArticleDomains
): boolean {
  try {
    const hostname = normalizeHostname(new URL(url).hostname);
    return allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

export function isLikelyReviewResult(input: {
  kind: ReviewKind;
  title: string;
  url: string;
  snippet?: string;
  allowedDomains?: string[];
}): boolean {
  const haystack = `${input.title} ${input.snippet ?? ""}`.toLowerCase();

  if (EXCLUDED_HOST_FRAGMENTS.some((fragment) => input.url.includes(fragment))) {
    return false;
  }

  if (input.kind === "article") {
    if (!isAllowedArticleUrl(input.url, input.allowedDomains)) {
      return false;
    }
  }

  return REVIEW_HINTS.some((hint) => haystack.includes(hint));
}

export function dedupeReviews(
  reviews: ReviewLink[],
  limit: number,
  excludedUrls: string[] = []
): ReviewLink[] {
  const excluded = new Set(excludedUrls.map(normalizeReviewUrl));
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const result: ReviewLink[] = [];

  for (const review of reviews) {
    const normalizedUrl = normalizeReviewUrl(review.url);
    const normalizedTitle = review.title.trim().toLowerCase();

    if (!normalizedUrl || excluded.has(normalizedUrl)) continue;
    if (seenUrls.has(normalizedUrl) || seenTitles.has(normalizedTitle)) continue;

    seenUrls.add(normalizedUrl);
    seenTitles.add(normalizedTitle);
    result.push({ ...review, url: normalizedUrl });

    if (result.length >= limit) break;
  }

  return result;
}

export function buildProductReviewQuery(
  brand: string,
  model: string,
  kind: ReviewKind
): string {
  const suffix = kind === "youtube" ? "video review" : "review";
  return `${brand} ${model} ${suffix}`;
}

export function mergeReviewCollections(
  current: ReviewCollection | undefined,
  incoming: ReviewCollection,
  config: ReviewSearchConfig = DEFAULT_REVIEW_SEARCH_CONFIG
): ReviewCollection {
  const excludedUrls = current?.manualExcludedUrls ?? incoming.manualExcludedUrls ?? [];

  return {
    lastReviewedAt: incoming.lastReviewedAt ?? current?.lastReviewedAt,
    manualExcludedUrls: excludedUrls,
    youtubeReviews: dedupeReviews(
      [...(incoming.youtubeReviews ?? []), ...(current?.youtubeReviews ?? [])],
      config.youtubeLimit,
      excludedUrls
    ),
    articleReviews: dedupeReviews(
      [...(incoming.articleReviews ?? []), ...(current?.articleReviews ?? [])],
      config.articleLimit,
      excludedUrls
    ),
  };
}
