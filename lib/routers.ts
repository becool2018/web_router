export type WifiStandard = "WiFi 6" | "WiFi 6E" | "WiFi 7";

/** Home mesh, desktop/traditional, travel-sized, or portable/mobile hotspot */
export type RouterType = "mesh" | "traditional" | "travel" | "portable";

/** Advertised capabilities used for filtering (subset typical of Amazon listings) */
export const SPECIAL_FEATURE_OPTIONS = [
  "Access Point Mode",
  "Beamforming",
  "Guest Mode",
  "Internet Security",
  "LED Indicator",
  "Parental Control",
  "QoS",
  "Remote Access",
  "USB Print Server",
  "Weatherproof",
] as const;

export type SpecialFeature = (typeof SPECIAL_FEATURE_OPTIONS)[number];

/** Radio band grouping as commonly listed on Amazon */
export const FREQUENCY_BAND_OPTIONS = [
  "Single-Band",
  "Dual-Band",
  "Tri-Band",
  "Quad-Band",
] as const;

export type FrequencyBandClass = (typeof FREQUENCY_BAND_OPTIONS)[number];

/** Amazon-style customer review average, whole stars 1–5 (sample — PAAPI later) */
export type CustomerReviewRating = 1 | 2 | 3 | 4 | 5;

/** Antenna form factor as commonly listed */
export const ANTENNA_TYPE_OPTIONS = ["Fixed", "Internal", "Retractable"] as const;

export type AntennaType = (typeof ANTENNA_TYPE_OPTIONS)[number];

/** Supported wireless security protocols (as commonly listed) */
export const SECURITY_PROTOCOL_OPTIONS = [
  "WPA2-PSK",
  "WPA3",
  "WPS",
  "WEP",
  "WPA-PSK",
  "WPA2-Enterprise",
  "WPS2",
] as const;

export type SecurityProtocol = (typeof SECURITY_PROTOCOL_OPTIONS)[number];

/** Filter keys for max download speed buckets (values in Mbps) */
export type MaxDownloadSpeedFilter =
  | "all"
  | "under-1-mbps"
  | "1-99-mbps"
  | "100-499-mbps"
  | "500-999-mbps"
  | "1gbps-plus";

/** Filter keys for upload speed buckets (values in Mbps) */
export type UploadSpeedFilter =
  | "all"
  | "under-1-mbps"
  | "1-49-mbps"
  | "50-99-mbps"
  | "100-249-mbps"
  | "250-499-mbps"
  | "500-mbps-plus";

export const MAX_DOWNLOAD_FILTER_OPTIONS: {
  value: MaxDownloadSpeedFilter;
  label: string;
}[] = [
  { value: "all", label: "All download speeds" },
  { value: "under-1-mbps", label: "Under 1 Mbps" },
  { value: "1-99-mbps", label: "1-99 Mbps" },
  { value: "100-499-mbps", label: "100-499 Mbps" },
  { value: "500-999-mbps", label: "500-999 Mbps" },
  { value: "1gbps-plus", label: "1 Gbps & above" },
];

export const UPLOAD_SPEED_FILTER_OPTIONS: {
  value: UploadSpeedFilter;
  label: string;
}[] = [
  { value: "all", label: "All upload speeds" },
  { value: "under-1-mbps", label: "Under 1 Mbps" },
  { value: "1-49-mbps", label: "1-49 Mbps" },
  { value: "50-99-mbps", label: "50-99 Mbps" },
  { value: "100-249-mbps", label: "100-249 Mbps" },
  { value: "250-499-mbps", label: "250-499 Mbps" },
  { value: "500-mbps-plus", label: "500 Mbps & above" },
];

export function matchesMaxDownloadBucket(
  mbps: number,
  filter: Exclude<MaxDownloadSpeedFilter, "all">
): boolean {
  if (filter === "under-1-mbps") return mbps < 1;
  if (filter === "1-99-mbps") return mbps >= 1 && mbps < 100;
  if (filter === "100-499-mbps") return mbps >= 100 && mbps < 500;
  if (filter === "500-999-mbps") return mbps >= 500 && mbps < 1000;
  if (filter === "1gbps-plus") return mbps >= 1000;
  return true;
}

export function matchesUploadBucket(
  mbps: number,
  filter: Exclude<UploadSpeedFilter, "all">
): boolean {
  if (filter === "under-1-mbps") return mbps < 1;
  if (filter === "1-49-mbps") return mbps >= 1 && mbps < 50;
  if (filter === "50-99-mbps") return mbps >= 50 && mbps < 100;
  if (filter === "100-249-mbps") return mbps >= 100 && mbps < 250;
  if (filter === "250-499-mbps") return mbps >= 250 && mbps < 500;
  if (filter === "500-mbps-plus") return mbps >= 500;
  return true;
}

/**
 * Price filter buckets: ~$100 steps from under $100 through $900–$999, then $1000+.
 * (First band covers typical sub-$100 listings, e.g. ~$9–$99.)
 */
export type PriceRangeFilter =
  | "all"
  | "under-100"
  | "100-199"
  | "200-299"
  | "300-399"
  | "400-499"
  | "500-599"
  | "600-699"
  | "700-799"
  | "800-899"
  | "900-999"
  | "1000-plus";

export const PRICE_RANGE_FILTER_OPTIONS: {
  value: PriceRangeFilter;
  label: string;
}[] = [
  { value: "all", label: "All prices" },
  { value: "under-100", label: "Under $100" },
  { value: "100-199", label: "$100 – $199" },
  { value: "200-299", label: "$200 – $299" },
  { value: "300-399", label: "$300 – $399" },
  { value: "400-499", label: "$400 – $499" },
  { value: "500-599", label: "$500 – $599" },
  { value: "600-699", label: "$600 – $699" },
  { value: "700-799", label: "$700 – $799" },
  { value: "800-899", label: "$800 – $899" },
  { value: "900-999", label: "$900 – $999" },
  { value: "1000-plus", label: "$1,000 & above" },
];

/** Returns true if `price` falls in the selected band (`all` matches everything). */
export function matchesPriceRange(price: number, filter: PriceRangeFilter): boolean {
  if (filter === "all") return true;
  if (filter === "under-100") return price < 100;
  if (filter === "1000-plus") return price >= 1000;
  const floors: Record<string, [number, number]> = {
    "100-199": [100, 200],
    "200-299": [200, 300],
    "300-399": [300, 400],
    "400-499": [400, 500],
    "500-599": [500, 600],
    "600-699": [600, 700],
    "700-799": [700, 800],
    "800-899": [800, 900],
    "900-999": [900, 1000],
  };
  const range = floors[filter];
  if (!range) return true;
  return price >= range[0] && price < range[1];
}

/** Format Mbps for display (sample WAN / radio headline speeds) */
export function formatMbps(mbps: number): string {
  if (!Number.isFinite(mbps) || mbps < 0) return "—";
  if (mbps > 0 && mbps < 1) return `${mbps.toFixed(2)} Mbps`;
  if (mbps >= 1000) {
    const g = mbps / 1000;
    return `${g % 1 === 0 ? String(g) : g.toFixed(1)} Gbps`;
  }
  return `${Math.round(mbps)} Mbps`;
}

export type RouterProduct = {
  id: number;
  model: string;
  brand: string;
  wifi: WifiStandard;
  /** Max theoretical wireless speed (Gbps), as shown on retail listings */
  speed: string;
  /** Coverage in sq ft (manufacturer / retail claim) */
  coverage: string;
  devices: string;
  price: number;
  asin: string;
  /** Mesh, traditional, travel, or portable form factor */
  routerType: RouterType;
  /** Product thumbnail path (local or remote). Fallback icon if missing or on error */
  thumbnailUrl?: string;
  /** Which special features apply (from `SPECIAL_FEATURE_OPTIONS`) */
  specialFeatures: SpecialFeature[];
  /** Frequency band class (from `FREQUENCY_BAND_OPTIONS`) */
  frequencyBandClass: FrequencyBandClass;
  /** Customer review rating (1–5 stars) */
  customerReviewRating: CustomerReviewRating;
  /** Antenna type (from `ANTENNA_TYPE_OPTIONS`) */
  antennaType: AntennaType;
  /** Advertised max download throughput (Mbps) — sample; align with listings */
  maxDownloadMbps: number;
  /** Advertised max upload throughput (Mbps) — sample; align with listings */
  maxUploadMbps: number;
  /** Supported security protocols (from `SECURITY_PROTOCOL_OPTIONS`) */
  securityProtocols: SecurityProtocol[];
  /** Listed on Amazon Today’s Deals (sample — PAAPI / Lightning Deals later) */
  todaysDeal: boolean;
  /** Prime-eligible shipping (sample — Buy Shipping API later) */
  primeEligible: boolean;
  /** Same-day delivery by 10 PM where offered */
  sameDayBy10pm: boolean;
  /** Overnight delivery by 8 AM where offered */
  overnightBy8am: boolean;
  /** Fastest quoted arrival window for Prime (sample) */
  deliveryArrivalDay: "today" | "tomorrow";
  /** Add-on / scheduled delivery options available (sample) */
  addOnDelivery: boolean;
};

/**
 * Static seed data. Replace with Amazon PAAPI-backed fetch later.
 *
 * `routerType` tagging:
 * - **mesh** — Multi-node mesh kits (Deco/Orbi/eero/Nest/Velop packs) or mesh-class routers (eero, Orbi RBR760, AmpliFi Alien).
 * - **traditional** — Standalone desktop / wall-plug home routers (ASUS RT/BE, Nighthawk RS/RAXE, Archer AX, Synology, budget AX models).
 * - **travel** — Pocket or compact travel / VPN routers (GL.iNet Beryl, Flint 2).
 * - **portable** — Cellular mobile hotspots / MiFi (Nighthawk M5/M6 class).
 *
 * `specialFeatures` — see `FEATURES_BY_ID` below (merged into each row).
 * `frequencyBandClass` — see `FREQUENCY_BY_ID` below (merged into each row).
 * `customerReviewRating` — see `REVIEW_RATING_BY_ID` below (merged into each row).
 * `antennaType` — see `ANTENNA_TYPE_BY_ID` below (merged into each row).
 * `maxDownloadMbps` / `maxUploadMbps` — see `WAN_SPEED_BY_ID` below (merged into each row).
 * `securityProtocols` — see `SECURITY_PROTOCOLS_BY_ID` below (merged into each row).
 * `todaysDeal` — see `TODAYS_DEAL_BY_ID` below (merged into each row).
 * Delivery fields — see `DELIVERY_BY_ID` below (merged into each row).
 */
const ROUTER_BASE: Omit<
  RouterProduct,
  | "specialFeatures"
  | "frequencyBandClass"
  | "customerReviewRating"
  | "antennaType"
  | "maxDownloadMbps"
  | "maxUploadMbps"
  | "securityProtocols"
  | "todaysDeal"
  | "primeEligible"
  | "sameDayBy10pm"
  | "overnightBy8am"
  | "deliveryArrivalDay"
  | "addOnDelivery"
>[] =
  [
  {
    id: 1,
    model: "eero Max 7",
    brand: "Amazon eero",
    wifi: "WiFi 7",
    speed: "9.4",
    coverage: "7500",
    devices: "200",
    price: 599.99,
    asin: "B0C5RRGBJF",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 2,
    model: "Deco XE75 Pro (3-Pack)",
    brand: "TP-Link",
    wifi: "WiFi 6E",
    speed: "5.4",
    coverage: "7200",
    devices: "200",
    price: 299.99,
    asin: "B09B7Y5M7N",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 3,
    model: "Orbi 970 Series Quad-Band WiFi 7",
    brand: "NETGEAR",
    wifi: "WiFi 7",
    speed: "10.0",
    coverage: "10000",
    devices: "200",
    price: 2299.99,
    asin: "B0CJBH4G8M",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 4,
    model: "RT-BE96U",
    brand: "ASUS",
    wifi: "WiFi 7",
    speed: "19.0",
    coverage: "3500",
    devices: "128",
    price: 699.99,
    asin: "B0CR18F1N2",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 5,
    model: "Nighthawk RS700S",
    brand: "NETGEAR",
    wifi: "WiFi 7",
    speed: "19.0",
    coverage: "3500",
    devices: "200",
    price: 699.99,
    asin: "B0BYJHQD9R",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 6,
    model: "Archer BE800",
    brand: "TP-Link",
    wifi: "WiFi 7",
    speed: "19.0",
    coverage: "3000",
    devices: "128",
    price: 499.99,
    asin: "B0C8JHQD9R",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 7,
    model: "Nest Wifi Pro (3-Pack)",
    brand: "Google",
    wifi: "WiFi 6E",
    speed: "5.4",
    coverage: "6600",
    devices: "300",
    price: 399.99,
    asin: "B0BJH5M7N1",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 8,
    model: "Orbi RBR760 (Router)",
    brand: "NETGEAR",
    wifi: "WiFi 6",
    speed: "4.2",
    coverage: "5000",
    devices: "100",
    price: 299.99,
    asin: "B09XYZ1234",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 9,
    model: "RT-AX6000",
    brand: "ASUS",
    wifi: "WiFi 6",
    speed: "6.0",
    coverage: "5000",
    devices: "128",
    price: 329.99,
    asin: "B09SH5M7N2",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 10,
    model: "Deco X55 (3-Pack)",
    brand: "TP-Link",
    wifi: "WiFi 6",
    speed: "3.0",
    coverage: "6500",
    devices: "150",
    price: 199.99,
    asin: "B09V5M7N3",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 11,
    model: "eero Pro 6E (3-Pack)",
    brand: "Amazon eero",
    wifi: "WiFi 6E",
    speed: "2.3",
    coverage: "6000",
    devices: "100+",
    price: 449.99,
    asin: "B09X5M7N4",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 12,
    model: "Nighthawk RS300",
    brand: "NETGEAR",
    wifi: "WiFi 7",
    speed: "9.3",
    coverage: "2500",
    devices: "120",
    price: 299.99,
    asin: "B0CZ5M7N5",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 13,
    model: "RT-BE3600",
    brand: "ASUS",
    wifi: "WiFi 7",
    speed: "3.6",
    coverage: "3000",
    devices: "128",
    price: 129.99,
    asin: "B0D15M7N6",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 14,
    model: "Velop MX2000 (3-Pack)",
    brand: "Linksys",
    wifi: "WiFi 6",
    speed: "3.0",
    coverage: "8100",
    devices: "120",
    price: 249.99,
    asin: "B09Y6M7N7",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 15,
    model: "Synology RT6600ax",
    brand: "Synology",
    wifi: "WiFi 6",
    speed: "4.8",
    coverage: "5500",
    devices: "128",
    price: 299.99,
    asin: "B09Z7M7N8",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 16,
    model: "TUF Gaming AX6000",
    brand: "ASUS",
    wifi: "WiFi 6",
    speed: "6.0",
    coverage: "3000",
    devices: "128",
    price: 229.99,
    asin: "B0A18M7N9",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 17,
    model: "Deco BE85 (3-Pack)",
    brand: "TP-Link",
    wifi: "WiFi 7",
    speed: "22.0",
    coverage: "9600",
    devices: "200",
    price: 1199.99,
    asin: "B0C28M7NA",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 18,
    model: "Nighthawk RAXE500",
    brand: "NETGEAR",
    wifi: "WiFi 6E",
    speed: "10.8",
    coverage: "3500",
    devices: "60",
    price: 399.99,
    asin: "B09ABM7NB",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 19,
    model: "Archer AXE16000",
    brand: "TP-Link",
    wifi: "WiFi 6E",
    speed: "15.6",
    coverage: "3500",
    devices: "128",
    price: 499.99,
    asin: "B09BCM7NC",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 20,
    model: "Orbi RBK863 (2-Pack)",
    brand: "NETGEAR",
    wifi: "WiFi 6",
    speed: "6.0",
    coverage: "8000",
    devices: "100",
    price: 699.99,
    asin: "B09CDM7ND",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 21,
    model: "RT-AXE7800",
    brand: "ASUS",
    wifi: "WiFi 6E",
    speed: "7.8",
    coverage: "3500",
    devices: "128",
    price: 279.99,
    asin: "B09DEM7NE",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 22,
    model: "G54 (5G + WiFi 7)",
    brand: "NETGEAR Nighthawk M6",
    wifi: "WiFi 7",
    speed: "3.6",
    coverage: "2500",
    devices: "32",
    price: 899.99,
    asin: "B0BEFM7NF",
    routerType: "portable",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 23,
    model: "Flint 2 (AX6000)",
    brand: "GL.iNet",
    wifi: "WiFi 6",
    speed: "6.0",
    coverage: "2500",
    devices: "120",
    price: 109.99,
    asin: "B0CG5M7NG",
    routerType: "travel",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 24,
    model: "AmpliFi Alien",
    brand: "Ubiquiti",
    wifi: "WiFi 6",
    speed: "7.7",
    coverage: "10000",
    devices: "128",
    price: 379.99,
    asin: "B08GHM7NH",
    routerType: "mesh",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 25,
    model: "R6700AX",
    brand: "NETGEAR",
    wifi: "WiFi 6",
    speed: "1.8",
    coverage: "1500",
    devices: "25",
    price: 79.99,
    asin: "B08HIM7NI",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 26,
    model: "Archer AX21",
    brand: "TP-Link",
    wifi: "WiFi 6",
    speed: "1.8",
    coverage: "2500",
    devices: "40",
    price: 69.99,
    asin: "B08HJM7NJ",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 27,
    model: "RT-AX1800S",
    brand: "ASUS",
    wifi: "WiFi 6",
    speed: "1.8",
    coverage: "3000",
    devices: "128",
    price: 89.99,
    asin: "B08HKM7NK",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 28,
    model: "MT-3000 Beryl AX",
    brand: "GL.iNet",
    wifi: "WiFi 6",
    speed: "3.0",
    coverage: "1500",
    devices: "64",
    price: 89.99,
    asin: "B0B7KM7NL",
    routerType: "travel",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 29,
    model: "Nighthawk M5 (5G Mobile Hotspot)",
    brand: "NETGEAR",
    wifi: "WiFi 6",
    speed: "1.8",
    coverage: "1000",
    devices: "32",
    price: 439.99,
    asin: "B08XKM7NM",
    routerType: "portable",
    thumbnailUrl: "/router-placeholder.svg",
  },
  {
    id: 30,
    model: "RE500X (2.4GHz WiFi 6 extender)",
    brand: "TP-Link",
    wifi: "WiFi 6",
    speed: "0.6",
    coverage: "1200",
    devices: "25",
    price: 39.99,
    asin: "B0RE5000XX",
    routerType: "traditional",
    thumbnailUrl: "/router-placeholder.svg",
  },
];

/** Per-model special features (sample data — align with PAAPI later) */
export const FEATURES_BY_ID: Record<number, SpecialFeature[]> = {
  1: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  2: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  3: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
    "Weatherproof",
    "USB Print Server",
  ],
  4: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
    "USB Print Server",
  ],
  5: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
    "USB Print Server",
  ],
  6: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
    "USB Print Server",
  ],
  7: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  8: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  9: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
    "USB Print Server",
  ],
  10: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  11: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  12: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  13: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  14: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  15: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  16: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
    "USB Print Server",
  ],
  17: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  18: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
    "USB Print Server",
  ],
  19: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
    "USB Print Server",
  ],
  20: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
    "Weatherproof",
  ],
  21: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
    "USB Print Server",
  ],
  22: [
    "Beamforming",
    "Guest Mode",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  23: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  24: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  25: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "LED Indicator",
    "Internet Security",
  ],
  26: [
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "LED Indicator",
    "Internet Security",
  ],
  27: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "Parental Control",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  28: [
    "Access Point Mode",
    "Beamforming",
    "Guest Mode",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  29: [
    "Guest Mode",
    "QoS",
    "Remote Access",
    "LED Indicator",
    "Internet Security",
  ],
  30: [
    "Beamforming",
    "Guest Mode",
    "LED Indicator",
    "QoS",
    "Remote Access",
    "Internet Security",
  ],
};

/** Per-model frequency band class (sample data — align with PAAPI later) */
export const FREQUENCY_BY_ID: Record<number, FrequencyBandClass> = {
  1: "Tri-Band",
  2: "Tri-Band",
  3: "Quad-Band",
  4: "Tri-Band",
  5: "Tri-Band",
  6: "Tri-Band",
  7: "Tri-Band",
  8: "Tri-Band",
  9: "Tri-Band",
  10: "Dual-Band",
  11: "Tri-Band",
  12: "Tri-Band",
  13: "Dual-Band",
  14: "Dual-Band",
  15: "Tri-Band",
  16: "Dual-Band",
  17: "Quad-Band",
  18: "Tri-Band",
  19: "Quad-Band",
  20: "Tri-Band",
  21: "Tri-Band",
  22: "Tri-Band",
  23: "Dual-Band",
  24: "Tri-Band",
  25: "Dual-Band",
  26: "Dual-Band",
  27: "Dual-Band",
  28: "Dual-Band",
  29: "Dual-Band",
  30: "Single-Band",
};

/** Per-model customer review star rating (sample data — align with PAAPI later) */
export const REVIEW_RATING_BY_ID: Record<number, CustomerReviewRating> = {
  1: 5,
  2: 4,
  3: 4,
  4: 5,
  5: 4,
  6: 4,
  7: 4,
  8: 4,
  9: 5,
  10: 4,
  11: 4,
  12: 4,
  13: 4,
  14: 3,
  15: 5,
  16: 5,
  17: 4,
  18: 4,
  19: 4,
  20: 4,
  21: 4,
  22: 3,
  23: 4,
  24: 4,
  25: 4,
  26: 4,
  27: 4,
  28: 4,
  29: 3,
  30: 3,
};

/** Per-model antenna type (sample data — align with PAAPI later) */
export const ANTENNA_TYPE_BY_ID: Record<number, AntennaType> = {
  1: "Internal",
  2: "Internal",
  3: "Internal",
  4: "Fixed",
  5: "Fixed",
  6: "Fixed",
  7: "Internal",
  8: "Internal",
  9: "Fixed",
  10: "Internal",
  11: "Internal",
  12: "Fixed",
  13: "Fixed",
  14: "Internal",
  15: "Fixed",
  16: "Fixed",
  17: "Internal",
  18: "Fixed",
  19: "Fixed",
  20: "Internal",
  21: "Fixed",
  22: "Internal",
  23: "Retractable",
  24: "Internal",
  25: "Fixed",
  26: "Fixed",
  27: "Fixed",
  28: "Retractable",
  29: "Internal",
  30: "Internal",
};

/** Advertised max download / upload (Mbps) — sample data — align with PAAPI later */
export const WAN_SPEED_BY_ID: Record<
  number,
  { maxDownloadMbps: number; maxUploadMbps: number }
> = {
  1: { maxDownloadMbps: 9400, maxUploadMbps: 9400 },
  2: { maxDownloadMbps: 5400, maxUploadMbps: 5400 },
  3: { maxDownloadMbps: 10000, maxUploadMbps: 10000 },
  4: { maxDownloadMbps: 19000, maxUploadMbps: 19000 },
  5: { maxDownloadMbps: 19000, maxUploadMbps: 19000 },
  6: { maxDownloadMbps: 19000, maxUploadMbps: 19000 },
  7: { maxDownloadMbps: 5400, maxUploadMbps: 5400 },
  8: { maxDownloadMbps: 4200, maxUploadMbps: 4200 },
  9: { maxDownloadMbps: 6000, maxUploadMbps: 6000 },
  10: { maxDownloadMbps: 3000, maxUploadMbps: 3000 },
  11: { maxDownloadMbps: 2300, maxUploadMbps: 2300 },
  12: { maxDownloadMbps: 9300, maxUploadMbps: 9300 },
  13: { maxDownloadMbps: 3600, maxUploadMbps: 3600 },
  14: { maxDownloadMbps: 3000, maxUploadMbps: 3000 },
  15: { maxDownloadMbps: 4800, maxUploadMbps: 4800 },
  16: { maxDownloadMbps: 6000, maxUploadMbps: 6000 },
  17: { maxDownloadMbps: 22000, maxUploadMbps: 22000 },
  18: { maxDownloadMbps: 10800, maxUploadMbps: 10800 },
  19: { maxDownloadMbps: 15600, maxUploadMbps: 15600 },
  20: { maxDownloadMbps: 6000, maxUploadMbps: 6000 },
  21: { maxDownloadMbps: 7800, maxUploadMbps: 7800 },
  22: { maxDownloadMbps: 750, maxUploadMbps: 300 },
  23: { maxDownloadMbps: 6000, maxUploadMbps: 6000 },
  24: { maxDownloadMbps: 7700, maxUploadMbps: 7700 },
  25: { maxDownloadMbps: 1800, maxUploadMbps: 1200 },
  26: { maxDownloadMbps: 1800, maxUploadMbps: 1200 },
  27: { maxDownloadMbps: 1800, maxUploadMbps: 1200 },
  28: { maxDownloadMbps: 3000, maxUploadMbps: 3000 },
  29: { maxDownloadMbps: 450, maxUploadMbps: 35 },
  30: { maxDownloadMbps: 0.8, maxUploadMbps: 0.6 },
};

/** Per-model security protocols (sample data — align with PAAPI later) */
export const SECURITY_PROTOCOLS_BY_ID: Record<number, SecurityProtocol[]> = {
  1: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  2: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  3: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
    "WEP",
  ],
  4: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  5: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  6: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  7: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  8: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  9: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  10: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  11: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  12: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  13: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  14: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  15: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  16: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  17: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  18: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  19: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  20: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  21: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  22: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  23: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  24: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPA2-Enterprise",
    "WPS",
    "WPS2",
  ],
  25: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
    "WEP",
  ],
  26: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
    "WEP",
  ],
  27: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  28: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  29: [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  30: [
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
    "WEP",
  ],
};

/** Sample: which SKUs are flagged as Today’s Deals */
export const TODAYS_DEAL_BY_ID: Record<number, boolean> = {
  1: false,
  2: true,
  3: false,
  4: false,
  5: true,
  6: false,
  7: true,
  8: false,
  9: true,
  10: false,
  11: false,
  12: true,
  13: false,
  14: false,
  15: false,
  16: true,
  17: true,
  18: false,
  19: false,
  20: false,
  21: true,
  22: false,
  23: true,
  24: false,
  25: false,
  26: true,
  27: false,
  28: true,
  29: true,
  30: false,
};

/** Sample Prime / delivery promises per SKU (replace with shipping API later) */
export const DELIVERY_BY_ID: Record<
  number,
  {
    primeEligible: boolean;
    sameDayBy10pm: boolean;
    overnightBy8am: boolean;
    deliveryArrivalDay: "today" | "tomorrow";
    addOnDelivery: boolean;
  }
> = {
  1: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: true,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  2: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: false,
    deliveryArrivalDay: "today",
    addOnDelivery: true,
  },
  3: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: false,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  4: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: true,
    deliveryArrivalDay: "today",
    addOnDelivery: false,
  },
  5: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: true,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: true,
  },
  6: {
    primeEligible: false,
    sameDayBy10pm: false,
    overnightBy8am: false,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  7: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: false,
    deliveryArrivalDay: "today",
    addOnDelivery: false,
  },
  8: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: true,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  9: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: false,
    deliveryArrivalDay: "today",
    addOnDelivery: true,
  },
  10: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: false,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  11: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: true,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: true,
  },
  12: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: true,
    deliveryArrivalDay: "today",
    addOnDelivery: false,
  },
  13: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: false,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  14: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: false,
    deliveryArrivalDay: "today",
    addOnDelivery: false,
  },
  15: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: true,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  16: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: false,
    deliveryArrivalDay: "today",
    addOnDelivery: true,
  },
  17: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: false,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  18: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: true,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  19: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: true,
    deliveryArrivalDay: "today",
    addOnDelivery: false,
  },
  20: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: false,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: true,
  },
  21: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: false,
    deliveryArrivalDay: "today",
    addOnDelivery: false,
  },
  22: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: true,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  23: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: false,
    deliveryArrivalDay: "today",
    addOnDelivery: true,
  },
  24: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: false,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  25: {
    primeEligible: false,
    sameDayBy10pm: false,
    overnightBy8am: false,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  26: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: true,
    deliveryArrivalDay: "today",
    addOnDelivery: false,
  },
  27: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: true,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  28: {
    primeEligible: true,
    sameDayBy10pm: true,
    overnightBy8am: false,
    deliveryArrivalDay: "today",
    addOnDelivery: true,
  },
  29: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: true,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
  30: {
    primeEligible: true,
    sameDayBy10pm: false,
    overnightBy8am: false,
    deliveryArrivalDay: "tomorrow",
    addOnDelivery: false,
  },
};

/** Delivery Day tabs (no “All” — one mode always selected) */
export type DeliveryDayFilter = "today" | "tomorrow";

export const DELIVERY_DAY_FILTER_OPTIONS: {
  value: DeliveryDayFilter;
  label: string;
}[] = [
  { value: "today", label: "Get It Today" },
  { value: "tomorrow", label: "Get It by Tomorrow" },
];

export function matchesDeliveryDay(
  r: RouterProduct,
  f: DeliveryDayFilter
): boolean {
  return r.deliveryArrivalDay === f;
}

/** Deals & Discounts filter: all listings vs Today’s Deals only */
export type DealsFilter = "all" | "todays";

export const DEALS_FILTER_OPTIONS: { value: DealsFilter; label: string }[] = [
  { value: "all", label: "All Discounts" },
  { value: "todays", label: "Today's Deals" },
];

export const ROUTERS: RouterProduct[] = ROUTER_BASE.map((r) => ({
  ...r,
  specialFeatures: FEATURES_BY_ID[r.id] ?? [],
  frequencyBandClass: FREQUENCY_BY_ID[r.id] ?? "Dual-Band",
  customerReviewRating: REVIEW_RATING_BY_ID[r.id] ?? 4,
  antennaType: ANTENNA_TYPE_BY_ID[r.id] ?? "Internal",
  maxDownloadMbps: WAN_SPEED_BY_ID[r.id]?.maxDownloadMbps ?? 1800,
  maxUploadMbps: WAN_SPEED_BY_ID[r.id]?.maxUploadMbps ?? 1200,
  securityProtocols: SECURITY_PROTOCOLS_BY_ID[r.id] ?? [
    "WPA3",
    "WPA2-PSK",
    "WPA-PSK",
    "WPS",
    "WPS2",
  ],
  todaysDeal: TODAYS_DEAL_BY_ID[r.id] ?? false,
  primeEligible: DELIVERY_BY_ID[r.id]?.primeEligible ?? true,
  sameDayBy10pm: DELIVERY_BY_ID[r.id]?.sameDayBy10pm ?? false,
  overnightBy8am: DELIVERY_BY_ID[r.id]?.overnightBy8am ?? false,
  deliveryArrivalDay: DELIVERY_BY_ID[r.id]?.deliveryArrivalDay ?? "tomorrow",
  addOnDelivery: DELIVERY_BY_ID[r.id]?.addOnDelivery ?? false,
}));

export function uniqueBrands(routers: RouterProduct[]): string[] {
  return Array.from(new Set(routers.map((r) => r.brand))).sort((a, b) =>
    a.localeCompare(b)
  );
}

/** Price per 1,000 sq ft of claimed coverage — lower is usually better value */
export function valueScorePer1kSqFt(router: RouterProduct): number {
  const sq = Number.parseFloat(router.coverage.replace(/,/g, ""));
  if (!Number.isFinite(sq) || sq <= 0) return Number.POSITIVE_INFINITY;
  return router.price / (sq / 1000);
}

export function formatValueScore(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
