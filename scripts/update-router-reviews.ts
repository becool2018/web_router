import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { ROUTERS } from "../lib/routers";
import {
  DEFAULT_REVIEW_SEARCH_CONFIG,
  buildProductReviewQuery,
  dedupeReviews,
  isLikelyReviewResult,
  mergeReviewCollections,
  type ReviewCollection,
  type ReviewLink,
} from "../lib/reviews";

type RouterReviewMap = Record<string, ReviewCollection>;

type SearchResult = {
  title: string;
  link: string;
  snippet?: string;
  source?: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const reviewFile = path.join(projectRoot, "data", "router-reviews.json");

async function readReviewMap(): Promise<RouterReviewMap> {
  try {
    const raw = await readFile(reviewFile, "utf8");
    return JSON.parse(raw) as RouterReviewMap;
  } catch {
    return {};
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function fetchYoutubeReviews(query: string): Promise<ReviewLink[]> {
  const apiKey = requireEnv("YOUTUBE_API_KEY");

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "6");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("key", apiKey);

  const searchResponse = await fetchJson<{
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        publishedAt?: string;
        description?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
      };
    }>;
  }>(searchUrl.toString());

  const reviews = (searchResponse.items ?? [])
    .map((item) => {
      const videoId = item.id?.videoId;
      const snippet = item.snippet;

      if (!videoId || !snippet?.title) return null;

      const url = `https://www.youtube.com/watch?v=${videoId}`;
      if (
        !isLikelyReviewResult({
          kind: "youtube",
          title: snippet.title,
          url,
          snippet: snippet.description,
        })
      ) {
        return null;
      }

      return {
        kind: "youtube" as const,
        title: snippet.title,
        url,
        sourceName: snippet.channelTitle ?? "YouTube",
        publishedAt: snippet.publishedAt,
        thumbnailUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.medium?.url,
        summarySnippet: snippet.description?.slice(0, 180),
      };
    })
    .filter(
      (
        review
      ): review is Exclude<typeof review, null> => review !== null
    );

  return dedupeReviews(reviews, DEFAULT_REVIEW_SEARCH_CONFIG.youtubeLimit);
}

async function fetchArticleSearchResults(query: string): Promise<SearchResult[]> {
  const apiKey = requireEnv("SERPAPI_API_KEY");

  const searchUrl = new URL("https://serpapi.com/search.json");
  searchUrl.searchParams.set("engine", "google");
  searchUrl.searchParams.set("num", "10");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("api_key", apiKey);

  const response = await fetchJson<{
    organic_results?: Array<{
      title?: string;
      link?: string;
      snippet?: string;
      source?: string;
    }>;
  }>(searchUrl.toString());

  return (response.organic_results ?? [])
    .map((result) => ({
      title: result.title ?? "",
      link: result.link ?? "",
      snippet: result.snippet,
      source: result.source,
    }))
    .filter((result) => result.title && result.link);
}

async function fetchArticleReviews(query: string): Promise<ReviewLink[]> {
  const results = await fetchArticleSearchResults(query);

  const reviews = results
    .filter((result) =>
      isLikelyReviewResult({
        kind: "article",
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        allowedDomains: DEFAULT_REVIEW_SEARCH_CONFIG.allowedArticleDomains,
      })
    )
    .map((result) => ({
      kind: "article" as const,
      title: result.title,
      url: result.link,
      sourceName: result.source ?? new URL(result.link).hostname.replace(/^www\./, ""),
      summarySnippet: result.snippet,
    }));

  return dedupeReviews(reviews, DEFAULT_REVIEW_SEARCH_CONFIG.articleLimit);
}

async function main() {
  const current = await readReviewMap();
  const next: RouterReviewMap = { ...current };

  for (const router of ROUTERS) {
    const youtubeQuery = buildProductReviewQuery(router.brand, router.model, "youtube");
    const articleQuery = buildProductReviewQuery(router.brand, router.model, "article");

    const [youtubeReviews, articleReviews] = await Promise.all([
      fetchYoutubeReviews(youtubeQuery),
      fetchArticleReviews(articleQuery),
    ]);

    next[String(router.id)] = mergeReviewCollections(current[String(router.id)], {
      youtubeReviews,
      articleReviews,
      lastReviewedAt: new Date().toISOString().slice(0, 10),
      manualExcludedUrls: current[String(router.id)]?.manualExcludedUrls ?? [],
    });

    console.log(
      `Updated ${router.brand} ${router.model}: ${youtubeReviews.length} YouTube, ${articleReviews.length} articles`
    );
  }

  await mkdir(path.dirname(reviewFile), { recursive: true });
  await writeFile(reviewFile, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`Saved review data to ${reviewFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
