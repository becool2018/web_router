import assert from "node:assert/strict";
import test from "node:test";

import { amazonLink, getAmazonAffiliateTag } from "../lib/amazon.ts";

test("uses configured Amazon affiliate tag when present", () => {
  process.env.AMAZON_AFFILIATE_TAG = "routertag-20";

  assert.equal(getAmazonAffiliateTag(), "routertag-20");
  assert.equal(
    amazonLink("B012345678"),
    "https://www.amazon.com/dp/B012345678?tag=routertag-20"
  );
});

test("falls back to dev placeholder outside production", () => {
  delete process.env.AMAZON_AFFILIATE_TAG;
  const previous = process.env.NODE_ENV;
  (process.env as Record<string, string | undefined>).NODE_ENV = "development";

  assert.equal(getAmazonAffiliateTag(), "dev-placeholder-20");
  assert.equal(
    amazonLink("B012345678"),
    "https://www.amazon.com/dp/B012345678?tag=dev-placeholder-20"
  );

  (process.env as Record<string, string | undefined>).NODE_ENV = previous;
});
