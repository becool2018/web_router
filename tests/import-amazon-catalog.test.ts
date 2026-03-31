import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSearchItemsPayload,
  dedupeByAsin,
  filterItemsForSeed,
  normalizeImportedItem,
  type ImportedCatalogItem,
  type PaapiSearchItem,
  type Seed,
} from "../scripts/import-amazon-catalog.ts";

test("normalizeImportedItem keeps core Amazon catalog fields and adds metadata", () => {
  process.env.AMAZON_AFFILIATE_TAG = "routertag-20";
  process.env.AMAZON_PAAPI_ACCESS_KEY = "key";
  process.env.AMAZON_PAAPI_SECRET_KEY = "secret";

  const item: PaapiSearchItem = {
    ASIN: "B0REAL1234",
    DetailPageURL: "https://www.amazon.com/dp/B0REAL1234",
    ItemInfo: {
      Title: {
        DisplayValue: "NETGEAR Nighthawk RS300 WiFi 7 Router",
      },
      ByLineInfo: {
        Brand: {
          DisplayValue: "NETGEAR",
        },
        Manufacturer: {
          DisplayValue: "NETGEAR",
        },
      },
      Features: {
        DisplayValues: ["Beamforming", "WPA3 Security"],
      },
    },
    Images: {
      Primary: {
        Large: {
          URL: "https://m.media-amazon.com/images/I/router.jpg",
        },
      },
    },
    BrowseNodeInfo: {
      BrowseNodes: [{ DisplayName: "Electronics" }, { DisplayName: "Routers" }],
    },
    OffersV2: {
      Listings: [
        {
          Price: {
            Amount: 299.99,
            Currency: "USD",
          },
        },
      ],
    },
    CustomerReviews: {
      StarRating: {
        Value: 4.6,
      },
      Count: 1234,
    },
  };

  const normalized = normalizeImportedItem(item, "wifi 7 router");

  assert.ok(normalized);
  assert.equal(normalized?.asin, "B0REAL1234");
  assert.equal(normalized?.brand, "NETGEAR");
  assert.equal(normalized?.price, 299.99);
  assert.equal(
    normalized?.affiliateUrl,
    "https://www.amazon.com/dp/B0REAL1234?tag=routertag-20"
  );
  assert.equal(normalized?.metadata?.query, "wifi 7 router");
  assert.equal(normalized?.metadata?.sourceApi, "paapi5");
});

test("normalizeImportedItem rejects items missing required amazon fields", () => {
  const item: PaapiSearchItem = {
    ASIN: "B0MISSING",
    ItemInfo: {
      Title: {
        DisplayValue: "Router without price",
      },
    },
  };

  assert.equal(normalizeImportedItem(item, "router"), null);
});

test("dedupeByAsin keeps the first occurrence of each ASIN", () => {
  const items: ImportedCatalogItem[] = [
    {
      asin: "B001",
      title: "First title",
      brand: "Brand A",
      price: 100,
      currency: "USD",
    },
    {
      asin: "B001",
      title: "Second title",
      brand: "Brand A",
      price: 110,
      currency: "USD",
    },
    {
      asin: "B002",
      title: "Third title",
      brand: "Brand B",
      price: 120,
      currency: "USD",
    },
  ];

  const deduped = dedupeByAsin(items);

  assert.equal(deduped.length, 2);
  assert.equal(deduped[0]?.title, "First title");
  assert.equal(deduped[1]?.asin, "B002");
});

test("filterItemsForSeed keeps only matching brands when brands are provided", () => {
  const seed: Seed = {
    query: "mesh wifi router system",
    routerType: "mesh",
    brands: ["Amazon eero", "TP-Link"],
  };
  const items: ImportedCatalogItem[] = [
    {
      asin: "B001",
      title: "eero Max 7 Mesh WiFi Router",
      brand: "Amazon eero",
      price: 599.99,
      currency: "USD",
    },
    {
      asin: "B002",
      title: "Nighthawk RS700S WiFi 7 Router",
      brand: "NETGEAR",
      price: 699.99,
      currency: "USD",
    },
  ];

  const filtered = filterItemsForSeed(items, seed);

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0]?.brand, "Amazon eero");
});

test("buildSearchItemsPayload includes required partner and pricing resources", () => {
  process.env.AMAZON_AFFILIATE_TAG = "routertag-20";
  process.env.AMAZON_PAAPI_ACCESS_KEY = "key";
  process.env.AMAZON_PAAPI_SECRET_KEY = "secret";
  process.env.AMAZON_PAAPI_MARKETPLACE = "www.amazon.com";

  const payload = buildSearchItemsPayload({
    query: "wifi 7 router",
    routerType: "traditional",
  });

  assert.equal(payload.Keywords, "wifi 7 router");
  assert.equal(payload.PartnerType, "Associates");
  assert.equal(payload.Marketplace, "www.amazon.com");
  assert.ok(payload.Resources.includes("OffersV2.Listings.Price"));
  assert.ok(payload.Resources.includes("Images.Primary.Large"));
});
