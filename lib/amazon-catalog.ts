import importedCatalog from "../data/router-catalog.json" with { type: "json" };

import {
  ROUTERS,
  type AntennaType,
  type CustomerReviewRating,
  type FrequencyBandClass,
  type RouterProduct,
  type RouterType,
  type SecurityProtocol,
  type SpecialFeature,
  type WifiStandard,
} from "./routers.ts";

export type AmazonCatalogItem = {
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

type RouterCatalogSeed = {
  asin: string;
  brand?: string;
  model?: string;
  routerType?: RouterType;
};

const importedItems = importedCatalog as AmazonCatalogItem[];
const routerSeedMap = new Map<string, RouterCatalogSeed>(
  ROUTERS.map((router) => [
    router.asin,
    {
      asin: router.asin,
      brand: router.brand,
      model: router.model,
      routerType: router.routerType,
    },
  ])
);

function normalizeBrand(value: string | undefined, title: string): string {
  if (value?.trim()) return value.trim();

  const firstChunk = title.split(/[,-]/)[0]?.trim();
  if (!firstChunk) return "Unknown";

  const words = firstChunk.split(/\s+/);
  if (words.length <= 2) return firstChunk;
  return words.slice(0, 2).join(" ");
}

function normalizeModel(title: string, brand: string, fallback?: string): string {
  if (fallback?.trim()) return fallback.trim();

  let cleaned = title.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  if (cleaned.toLowerCase().startsWith(brand.toLowerCase())) {
    cleaned = cleaned.slice(brand.length).trim();
  }
  return cleaned || title;
}

function parseWifiStandard(text: string): WifiStandard {
  const haystack = text.toLowerCase();
  if (haystack.includes("wifi 7") || haystack.includes("wi-fi 7")) return "WiFi 7";
  if (haystack.includes("wifi 6e") || haystack.includes("wi-fi 6e")) return "WiFi 6E";
  return "WiFi 6";
}

function parseRouterType(text: string, fallback?: RouterType): RouterType {
  if (fallback) return fallback;

  const haystack = text.toLowerCase();
  if (haystack.includes("mesh")) return "mesh";
  if (haystack.includes("travel")) return "travel";
  if (haystack.includes("hotspot") || haystack.includes("mobile")) return "portable";
  return "traditional";
}

function parseNumberMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/,/g, "");
    }
  }
  return undefined;
}

function parseSpeedGbps(text: string): string {
  const match = parseNumberMatch(text, [
    /(\d+(?:\.\d+)?)\s*gbps/i,
    /be\s?(\d{4,5})/i,
    /ax\s?(\d{4,5})/i,
    /axe\s?(\d{4,5})/i,
  ]);

  if (!match) return "2.4";
  const asNumber = Number(match);
  if (!Number.isFinite(asNumber)) return "2.4";
  if (asNumber > 100) return (asNumber / 1000).toFixed(1);
  return asNumber.toFixed(1).replace(/\.0$/, ".0");
}

function parseCoverageSqFt(text: string): string {
  return (
    parseNumberMatch(text, [
      /(\d{3,5})\s*(?:sq\s*ft|square\s*feet)/i,
      /covers?\s*up\s*to\s*(\d{3,5})/i,
    ]) ?? "2500"
  );
}

function parseDeviceCount(text: string): string {
  return (
    parseNumberMatch(text, [
      /(\d+)\+?\s*(?:devices|device)/i,
      /up\s*to\s*(\d+)\s*(?:devices|device)/i,
    ]) ?? "64"
  );
}

function parseFeatures(text: string): SpecialFeature[] {
  const haystack = text.toLowerCase();
  const features: SpecialFeature[] = [];
  if (haystack.includes("beamforming")) features.push("Beamforming");
  if (haystack.includes("guest")) features.push("Guest Mode");
  if (haystack.includes("parental")) features.push("Parental Control");
  if (haystack.includes("qos")) features.push("QoS");
  if (haystack.includes("remote")) features.push("Remote Access");
  if (haystack.includes("security")) features.push("Internet Security");
  if (haystack.includes("access point")) features.push("Access Point Mode");
  if (haystack.includes("usb")) features.push("USB Print Server");
  if (haystack.includes("led")) features.push("LED Indicator");
  return Array.from(new Set(features));
}

function parseFrequencyBand(text: string): FrequencyBandClass {
  const haystack = text.toLowerCase();
  if (haystack.includes("quad-band")) return "Quad-Band";
  if (haystack.includes("tri-band")) return "Tri-Band";
  if (haystack.includes("single-band")) return "Single-Band";
  return "Dual-Band";
}

function parseAntennaType(text: string): AntennaType {
  const haystack = text.toLowerCase();
  if (haystack.includes("retractable")) return "Retractable";
  if (haystack.includes("external") || haystack.includes("fixed antenna")) return "Fixed";
  return "Internal";
}

function parseSecurityProtocols(text: string): SecurityProtocol[] {
  const haystack = text.toLowerCase();
  const protocols: SecurityProtocol[] = [];
  if (haystack.includes("wpa3")) protocols.push("WPA3");
  if (haystack.includes("wpa2")) protocols.push("WPA2-PSK");
  if (haystack.includes("wpa ")) protocols.push("WPA-PSK");
  if (haystack.includes("enterprise")) protocols.push("WPA2-Enterprise");
  if (haystack.includes("wep")) protocols.push("WEP");
  if (haystack.includes("wps2")) protocols.push("WPS2");
  if (haystack.includes("wps")) protocols.push("WPS");
  return protocols.length ? Array.from(new Set(protocols)) : ["WPA3", "WPA2-PSK"];
}

function parseRating(value: number | undefined): CustomerReviewRating {
  const rounded = Math.round(value ?? 4);
  if (rounded <= 1) return 1;
  if (rounded >= 5) return 5;
  return rounded as CustomerReviewRating;
}

function mergedText(item: AmazonCatalogItem): string {
  return [
    item.title,
    item.byLine,
    ...(item.features ?? []),
    ...(item.browseNodeNames ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

export function catalogItemToRouterProduct(
  item: AmazonCatalogItem,
  index: number
): RouterProduct {
  const seed = routerSeedMap.get(item.asin);
  const text = mergedText(item);
  const brand = normalizeBrand(item.brand, item.title);
  const model = normalizeModel(item.title, brand, seed?.model);

  return {
    id: ROUTERS.find((router) => router.asin === item.asin)?.id ?? ROUTERS.length + index + 1,
    asin: item.asin,
    brand: seed?.brand ?? brand,
    model,
    wifi: parseWifiStandard(text),
    speed: parseSpeedGbps(text),
    coverage: parseCoverageSqFt(text),
    devices: parseDeviceCount(text),
    price: item.price,
    routerType: parseRouterType(text, seed?.routerType),
    thumbnailUrl: item.imageUrl,
    specialFeatures: parseFeatures(text),
    frequencyBandClass: parseFrequencyBand(text),
    customerReviewRating: parseRating(item.customerReviewRating),
    antennaType: parseAntennaType(text),
    maxDownloadMbps: Math.max(Math.round(Number(parseSpeedGbps(text)) * 1000), 600),
    maxUploadMbps: Math.max(Math.round(Number(parseSpeedGbps(text)) * 250), 100),
    securityProtocols: parseSecurityProtocols(text),
    todaysDeal: false,
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: false,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  };
}

export const IMPORTED_ROUTER_ITEMS = importedItems;

export const IMPORTED_ROUTERS: RouterProduct[] = importedItems
  .filter((item) => item.asin && Number.isFinite(item.price))
  .map(catalogItemToRouterProduct);
