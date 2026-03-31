import { createHmac, createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import routerSeeds from "../data/router-catalog-seeds.json" with { type: "json" };
import { amazonLink } from "../lib/amazon.ts";
import type { RouterType } from "../lib/routers.ts";

export type Seed = {
  query: string;
  routerType: RouterType;
  brands?: string[];
};

export type PaapiSearchItem = {
  ASIN?: string;
  DetailPageURL?: string;
  ItemInfo?: {
    ByLineInfo?: {
      Brand?: { DisplayValue?: string };
      Manufacturer?: { DisplayValue?: string };
    };
    Features?: {
      DisplayValues?: string[];
    };
    ProductInfo?: {
      ItemDimensions?: unknown;
    };
    Title?: {
      DisplayValue?: string;
    };
  };
  Images?: {
    Primary?: {
      Large?: { URL?: string };
      Medium?: { URL?: string };
      Small?: { URL?: string };
    };
  };
  BrowseNodeInfo?: {
    BrowseNodes?: Array<{
      DisplayName?: string;
    }>;
  };
  OffersV2?: {
    Listings?: Array<{
      Price?: {
        Amount?: number;
        Currency?: string;
      };
    }>;
  };
  CustomerReviews?: {
    StarRating?: {
      Value?: number;
    };
    Count?: number;
  };
};

export type ImportedCatalogItem = {
  asin: string;
  detailPageUrl?: string;
  title: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl?: string;
  affiliateUrl?: string;
  marketplace?: string;
  features?: string[];
  byLine?: string;
  customerReviewRating?: number;
  customerReviewCount?: number;
  browseNodeNames?: string[];
  metadata?: {
    fetchedAt: string;
    query: string;
    sourceApi: "paapi5";
  };
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(projectRoot, "data", "router-catalog.json");
const isExecutedDirectly = process.argv[1]
  ? path.resolve(process.argv[1]) === __filename
  : false;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getPaapiConfig() {
  return {
    accessKey: requireEnv("AMAZON_PAAPI_ACCESS_KEY"),
    secretKey: requireEnv("AMAZON_PAAPI_SECRET_KEY"),
    partnerTag: process.env.AMAZON_PARTNER_TAG?.trim() ?? requireEnv("AMAZON_AFFILIATE_TAG"),
    host: process.env.AMAZON_PAAPI_HOST?.trim() ?? "webservices.amazon.com",
    region: process.env.AMAZON_PAAPI_REGION?.trim() ?? "us-east-1",
    marketplace: process.env.AMAZON_PAAPI_MARKETPLACE?.trim() ?? "www.amazon.com",
  };
}

function sha256Hex(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function hmac(key: Buffer | string, content: string): Buffer {
  return createHmac("sha256", key).update(content, "utf8").digest();
}

function getSignatureKey(secretKey: string, dateStamp: string, region: string): Buffer {
  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "ProductAdvertisingAPI");
  return hmac(kService, "aws4_request");
}

async function signedPaapiPost<T>(target: string, payload: object): Promise<T> {
  const config = getPaapiConfig();
  const body = JSON.stringify(payload);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const canonicalUri = "/paapi5/searchitems";
  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${config.host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${target}\n`;
  const signedHeaders = "content-encoding;content-type;host;x-amz-date;x-amz-target";
  const canonicalRequest = [
    "POST",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    sha256Hex(body),
  ].join("\n");

  const credentialScope = `${dateStamp}/${config.region}/ProductAdvertisingAPI/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(config.secretKey, dateStamp, config.region);
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${config.host}${canonicalUri}`, {
    method: "POST",
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: config.host,
      "x-amz-date": amzDate,
      "x-amz-target": target,
      Authorization: authorization,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PA-API request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

export function normalizeImportedItem(
  item: PaapiSearchItem,
  query: string
): ImportedCatalogItem | null {
  const title = item.ItemInfo?.Title?.DisplayValue?.trim();
  const asin = item.ASIN?.trim();
  const brand =
    item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue?.trim() ??
    item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue?.trim() ??
    "";
  const listing = item.OffersV2?.Listings?.[0];
  const amount = listing?.Price?.Amount;

  if (!asin || !title || !amount) return null;

  return {
    asin,
    title,
    brand,
    price: amount,
    currency: listing?.Price?.Currency ?? "USD",
    detailPageUrl: item.DetailPageURL,
    imageUrl:
      item.Images?.Primary?.Large?.URL ??
      item.Images?.Primary?.Medium?.URL ??
      item.Images?.Primary?.Small?.URL,
    affiliateUrl: amazonLink(asin),
    marketplace: getPaapiConfig().marketplace,
    features: item.ItemInfo?.Features?.DisplayValues,
    byLine:
      item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue ??
      item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
    customerReviewRating: item.CustomerReviews?.StarRating?.Value,
    customerReviewCount: item.CustomerReviews?.Count,
    browseNodeNames:
      item.BrowseNodeInfo?.BrowseNodes?.map((node) => node.DisplayName).filter(
        (value): value is string => Boolean(value)
      ) ?? [],
    metadata: {
      fetchedAt: new Date().toISOString(),
      query,
      sourceApi: "paapi5",
    },
  };
}

export function dedupeByAsin(items: ImportedCatalogItem[]): ImportedCatalogItem[] {
  const seen = new Set<string>();
  const deduped: ImportedCatalogItem[] = [];

  for (const item of items) {
    if (seen.has(item.asin)) continue;
    seen.add(item.asin);
    deduped.push(item);
  }

  return deduped;
}

export function buildSearchItemsPayload(seed: Seed) {
  const config = getPaapiConfig();
  return {
    Keywords: seed.query,
    SearchIndex: "Electronics",
    PartnerTag: config.partnerTag,
    PartnerType: "Associates",
    Marketplace: config.marketplace,
    ItemCount: 10,
    Resources: [
      "BrowseNodeInfo.BrowseNodes",
      "CustomerReviews.Count",
      "CustomerReviews.StarRating",
      "Images.Primary.Large",
      "Images.Primary.Medium",
      "ItemInfo.ByLineInfo",
      "ItemInfo.Features",
      "ItemInfo.ProductInfo",
      "ItemInfo.Title",
      "OffersV2.Listings.Price",
    ],
  };
}

export function filterItemsForSeed(
  items: ImportedCatalogItem[],
  seed: Seed
): ImportedCatalogItem[] {
  return items.filter((item) =>
    seed.brands?.length
      ? seed.brands.some((brand) =>
          `${item.brand} ${item.title}`.toLowerCase().includes(brand.toLowerCase())
        )
      : true
  );
}

async function fetchSeed(seed: Seed): Promise<ImportedCatalogItem[]> {
  const payload = buildSearchItemsPayload(seed);

  const response = await signedPaapiPost<{ SearchResult?: { Items?: PaapiSearchItem[] } }>(
    "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    payload
  );

  const items =
    response.SearchResult?.Items?.map((item) => normalizeImportedItem(item, seed.query)).filter(
      (item): item is ImportedCatalogItem => item !== null
    ) ?? [];

  return filterItemsForSeed(items, seed);
}

async function main() {
  const seeds = routerSeeds as Seed[];
  const imported = (
    await Promise.all(
      seeds.map(async (seed) => {
        const items = await fetchSeed(seed);
        console.log(`Fetched ${items.length} items for "${seed.query}"`);
        return items;
      })
    )
  ).flat();

  const deduped = dedupeByAsin(imported).sort((left, right) => left.price - right.price);
  await mkdir(path.dirname(catalogPath), { recursive: true });
  await writeFile(catalogPath, `${JSON.stringify(deduped, null, 2)}\n`, "utf8");
  console.log(`Saved ${deduped.length} Amazon catalog items to ${catalogPath}`);
}

if (isExecutedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
