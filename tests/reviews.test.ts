import assert from "node:assert/strict";
import test from "node:test";

import {
  dedupeReviews,
  isLikelyReviewResult,
  mergeReviewCollections,
  normalizeReviewUrl,
  type ReviewLink,
} from "../lib/reviews.ts";

test("normalizeReviewUrl collapses youtube variants to one watch url", () => {
  assert.equal(
    normalizeReviewUrl("https://youtu.be/abc123?t=30"),
    "https://www.youtube.com/watch?v=abc123"
  );
  assert.equal(
    normalizeReviewUrl("https://www.youtube.com/watch?v=abc123&feature=share"),
    "https://www.youtube.com/watch?v=abc123"
  );
});

test("dedupeReviews removes duplicates and excluded urls", () => {
  const input: ReviewLink[] = [
    {
      kind: "article",
      title: "TP-Link Deco XE75 Pro review",
      url: "https://www.techradar.com/reviews/tp-link-deco-xe75-pro",
      sourceName: "TechRadar",
    },
    {
      kind: "article",
      title: "TP-Link Deco XE75 Pro review",
      url: "https://www.techradar.com/reviews/tp-link-deco-xe75-pro?utm_source=test",
      sourceName: "TechRadar",
    },
    {
      kind: "article",
      title: "Other review",
      url: "https://www.pcmag.com/reviews/deco-xe75-pro",
      sourceName: "PCMag",
    },
  ];

  const deduped = dedupeReviews(input, 3, [
    "https://www.pcmag.com/reviews/deco-xe75-pro",
  ]);

  assert.equal(deduped.length, 1);
  assert.equal(
    deduped[0]?.url,
    "https://www.techradar.com/reviews/tp-link-deco-xe75-pro"
  );
});

test("isLikelyReviewResult accepts likely reviews and rejects irrelevant pages", () => {
  assert.equal(
    isLikelyReviewResult({
      kind: "article",
      title: "TP-Link Deco XE75 Pro review: fast WiFi 6E mesh",
      url: "https://www.techradar.com/reviews/tp-link-deco-xe75-pro",
      snippet: "Our full review of TP-Link's mesh system.",
      allowedDomains: ["techradar.com"],
    }),
    true
  );

  assert.equal(
    isLikelyReviewResult({
      kind: "article",
      title: "Buy TP-Link Deco XE75 Pro now",
      url: "https://www.amazon.com/dp/B09B7Y5M7N",
      snippet: "Retail listing",
      allowedDomains: ["techradar.com"],
    }),
    false
  );
});

test("mergeReviewCollections keeps manual exclusions and caps review counts", () => {
  const merged = mergeReviewCollections(
    {
      youtubeReviews: [],
      articleReviews: [],
      manualExcludedUrls: ["https://www.youtube.com/watch?v=skip-me"],
      lastReviewedAt: "2026-03-01",
    },
    {
      youtubeReviews: [
        {
          kind: "youtube",
          title: "Keep me review",
          url: "https://www.youtube.com/watch?v=keep-me",
          sourceName: "Channel",
        },
        {
          kind: "youtube",
          title: "Skip me review",
          url: "https://www.youtube.com/watch?v=skip-me",
          sourceName: "Channel",
        },
      ],
      articleReviews: [],
      lastReviewedAt: "2026-03-30",
    }
  );

  assert.deepEqual(merged.manualExcludedUrls, [
    "https://www.youtube.com/watch?v=skip-me",
  ]);
  assert.equal(merged.youtubeReviews.length, 1);
  assert.equal(merged.youtubeReviews[0]?.title, "Keep me review");
  assert.equal(merged.lastReviewedAt, "2026-03-30");
});
