"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { RouterProductCard } from "@/components/router-product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCTS } from "@/lib/catalog";
import {
  ANTENNA_TYPE_OPTIONS,
  DEALS_FILTER_OPTIONS,
  DELIVERY_DAY_FILTER_OPTIONS,
  FREQUENCY_BAND_OPTIONS,
  matchesDeliveryDay,
  matchesMaxDownloadBucket,
  matchesPriceRange,
  matchesUploadBucket,
  MAX_DOWNLOAD_FILTER_OPTIONS,
  PRICE_RANGE_FILTER_OPTIONS,
  SECURITY_PROTOCOL_OPTIONS,
  SPECIAL_FEATURE_OPTIONS,
  UPLOAD_SPEED_FILTER_OPTIONS,
  uniqueBrands,
  type AntennaType,
  type DealsFilter,
  type DeliveryDayFilter,
  type FrequencyBandClass,
  type MaxDownloadSpeedFilter,
  type PriceRangeFilter,
  type RouterType,
  type SecurityProtocol,
  type SpecialFeature,
  type UploadSpeedFilter,
  type WifiStandard,
} from "@/lib/routers";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

type TypeFilter = "all" | RouterType;
type SpecialFeatureFilter = "all" | SpecialFeature;
type SecurityProtocolFilter = "all" | SecurityProtocol;
type FrequencyBandFilter = "all" | FrequencyBandClass;
type AntennaTypeFilter = "all" | AntennaType;
type SortOption = "value" | "price-low" | "price-high" | "reviews";

function DeliveryFilterTabs<T extends string>({
  heading,
  value,
  onValueChange,
  options,
}: {
  heading: string;
  value: T;
  onValueChange: (v: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground">{heading}</p>
      <div
        className="flex flex-wrap gap-1 rounded-xl bg-muted p-[3px]"
        role="tablist"
        aria-label={heading}
      >
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "min-h-8 shrink-0 rounded-lg border border-transparent px-3 py-1 text-xs font-medium transition-all",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onValueChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Select
        value={value}
        onValueChange={(nextValue) => onValueChange(nextValue ?? options[0]?.value ?? "all")}
      >
        <SelectTrigger size="sm" className="h-9 w-full min-w-0 sm:w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function RouterStorefront() {
  const brands = React.useMemo(() => uniqueBrands(PRODUCTS), []);

  const [search, setSearch] = React.useState("");
  const [brand, setBrand] = React.useState<string>("all");
  const [wifi, setWifi] = React.useState<WifiStandard | "all">("all");
  const [priceRangeFilter, setPriceRangeFilter] =
    React.useState<PriceRangeFilter>("all");
  const [dealsFilter, setDealsFilter] = React.useState<DealsFilter>("all");
  const [deliveryDayFilter, setDeliveryDayFilter] =
    React.useState<DeliveryDayFilter>("tomorrow");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [specialFeatureFilter, setSpecialFeatureFilter] =
    React.useState<SpecialFeatureFilter>("all");
  const [securityProtocolFilter, setSecurityProtocolFilter] =
    React.useState<SecurityProtocolFilter>("all");
  const [frequencyBandFilter, setFrequencyBandFilter] =
    React.useState<FrequencyBandFilter>("all");
  const [antennaTypeFilter, setAntennaTypeFilter] =
    React.useState<AntennaTypeFilter>("all");
  const [downloadFilter, setDownloadFilter] =
    React.useState<MaxDownloadSpeedFilter>("all");
  const [uploadFilter, setUploadFilter] =
    React.useState<UploadSpeedFilter>("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("value");
  const [pageIndex, setPageIndex] = React.useState(0);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return PRODUCTS.filter((product) => {
      if (query) {
        const haystack = `${product.model} ${product.brand}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (brand !== "all" && product.brand !== brand) return false;
      if (wifi !== "all" && product.wifi !== wifi) return false;
      if (!matchesPriceRange(product.price, priceRangeFilter)) return false;
      if (dealsFilter === "todays" && !product.todaysDeal) return false;
      if (!matchesDeliveryDay(product, deliveryDayFilter)) return false;
      if (typeFilter !== "all" && product.routerType !== typeFilter) return false;
      if (
        specialFeatureFilter !== "all" &&
        !product.specialFeatures.includes(specialFeatureFilter)
      ) {
        return false;
      }
      if (
        securityProtocolFilter !== "all" &&
        !product.securityProtocols.includes(securityProtocolFilter)
      ) {
        return false;
      }
      if (
        frequencyBandFilter !== "all" &&
        product.frequencyBandClass !== frequencyBandFilter
      ) {
        return false;
      }
      if (antennaTypeFilter !== "all" && product.antennaType !== antennaTypeFilter) {
        return false;
      }
      if (
        downloadFilter !== "all" &&
        !matchesMaxDownloadBucket(product.maxDownloadMbps, downloadFilter)
      ) {
        return false;
      }
      if (
        uploadFilter !== "all" &&
        !matchesUploadBucket(product.maxUploadMbps, uploadFilter)
      ) {
        return false;
      }

      return true;
    }).sort((left, right) => {
      if (sortBy === "price-low") return left.price - right.price;
      if (sortBy === "price-high") return right.price - left.price;
      if (sortBy === "reviews") {
        const leftCount =
          left.reviewCollection.youtubeReviews.length +
          left.reviewCollection.articleReviews.length;
        const rightCount =
          right.reviewCollection.youtubeReviews.length +
          right.reviewCollection.articleReviews.length;
        return rightCount - leftCount;
      }

      const leftValue = left.price / Math.max(Number(left.coverage), 1);
      const rightValue = right.price / Math.max(Number(right.coverage), 1);
      return leftValue - rightValue;
    });
  }, [
    antennaTypeFilter,
    brand,
    dealsFilter,
    deliveryDayFilter,
    downloadFilter,
    frequencyBandFilter,
    priceRangeFilter,
    search,
    securityProtocolFilter,
    sortBy,
    specialFeatureFilter,
    typeFilter,
    uploadFilter,
    wifi,
  ]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [
    antennaTypeFilter,
    brand,
    dealsFilter,
    deliveryDayFilter,
    downloadFilter,
    frequencyBandFilter,
    priceRangeFilter,
    search,
    securityProtocolFilter,
    sortBy,
    specialFeatureFilter,
    typeFilter,
    uploadFilter,
    wifi,
  ]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = filtered.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
        <div className="bg-linear-to-br from-primary/[0.09] via-background to-background px-5 py-6 sm:px-6 sm:py-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Router Review Storefront
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Compare wireless routers, then check video and article reviews before you buy.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Each router includes Amazon buying links, YouTube reviews, and third-party review
              articles in one place. This version stays intentionally simple: one page, fast
              filters, and clean product blocks.
            </p>
          </div>
        </div>

        <div className="border-t border-border px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
            <div className="w-full xl:max-w-sm">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search model or brand"
                  className="h-10 pl-9 text-sm"
                  aria-label="Search routers"
                />
              </div>
              <div className="mt-3 rounded-2xl border border-border bg-background/70 p-4">
                <DeliveryFilterTabs
                  heading="Delivery day"
                  value={deliveryDayFilter}
                  onValueChange={(value) => setDeliveryDayFilter(value as DeliveryDayFilter)}
                  options={DELIVERY_DAY_FILTER_OPTIONS}
                />
              </div>
            </div>

            <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
              <FilterSelect
                label="Brand"
                value={brand}
                onValueChange={setBrand}
                options={[
                  { value: "all", label: "All brands" },
                  ...brands.map((entry) => ({ value: entry, label: entry })),
                ]}
              />
              <FilterSelect
                label="WiFi"
                value={wifi}
                onValueChange={(value) => setWifi(value as WifiStandard | "all")}
                options={[
                  { value: "all", label: "All standards" },
                  { value: "WiFi 6", label: "WiFi 6" },
                  { value: "WiFi 6E", label: "WiFi 6E" },
                  { value: "WiFi 7", label: "WiFi 7" },
                ]}
              />
              <FilterSelect
                label="Price"
                value={priceRangeFilter}
                onValueChange={(value) => setPriceRangeFilter(value as PriceRangeFilter)}
                options={PRICE_RANGE_FILTER_OPTIONS}
              />
              <FilterSelect
                label="Deals"
                value={dealsFilter}
                onValueChange={(value) => setDealsFilter(value as DealsFilter)}
                options={DEALS_FILTER_OPTIONS}
              />
              <FilterSelect
                label="Type"
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as TypeFilter)}
                options={[
                  { value: "all", label: "All types" },
                  { value: "mesh", label: "Mesh" },
                  { value: "traditional", label: "Traditional" },
                  { value: "travel", label: "Travel" },
                  { value: "portable", label: "Portable" },
                ]}
              />
              <FilterSelect
                label="Feature"
                value={specialFeatureFilter}
                onValueChange={(value) =>
                  setSpecialFeatureFilter(value as SpecialFeatureFilter)
                }
                options={[
                  { value: "all", label: "All features" },
                  ...SPECIAL_FEATURE_OPTIONS.map((entry) => ({
                    value: entry,
                    label: entry,
                  })),
                ]}
              />
              <FilterSelect
                label="Security"
                value={securityProtocolFilter}
                onValueChange={(value) =>
                  setSecurityProtocolFilter(value as SecurityProtocolFilter)
                }
                options={[
                  { value: "all", label: "All protocols" },
                  ...SECURITY_PROTOCOL_OPTIONS.map((entry) => ({
                    value: entry,
                    label: entry,
                  })),
                ]}
              />
              <FilterSelect
                label="Band"
                value={frequencyBandFilter}
                onValueChange={(value) =>
                  setFrequencyBandFilter(value as FrequencyBandFilter)
                }
                options={[
                  { value: "all", label: "All bands" },
                  ...FREQUENCY_BAND_OPTIONS.map((entry) => ({
                    value: entry,
                    label: entry,
                  })),
                ]}
              />
              <FilterSelect
                label="Antenna"
                value={antennaTypeFilter}
                onValueChange={(value) => setAntennaTypeFilter(value as AntennaTypeFilter)}
                options={[
                  { value: "all", label: "All antenna types" },
                  ...ANTENNA_TYPE_OPTIONS.map((entry) => ({
                    value: entry,
                    label: entry,
                  })),
                ]}
              />
              <FilterSelect
                label="Download"
                value={downloadFilter}
                onValueChange={(value) => setDownloadFilter(value as MaxDownloadSpeedFilter)}
                options={MAX_DOWNLOAD_FILTER_OPTIONS}
              />
              <FilterSelect
                label="Upload"
                value={uploadFilter}
                onValueChange={(value) => setUploadFilter(value as UploadSpeedFilter)}
                options={UPLOAD_SPEED_FILTER_OPTIONS}
              />
              <FilterSelect
                label="Sort"
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
                options={[
                  { value: "value", label: "Best value" },
                  { value: "price-low", label: "Price: low to high" },
                  { value: "price-high", label: "Price: high to low" },
                  { value: "reviews", label: "Most review links" },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} router{filtered.length === 1 ? "" : "s"}
          {filtered.length !== PRODUCTS.length ? ` of ${PRODUCTS.length}` : ""}.
        </p>
        <p className="text-sm text-muted-foreground">
          Reviews appear under each product, and every Amazon button uses your affiliate tag when
          configured.
        </p>
      </div>

      <div className="space-y-5">
        {currentPage.length ? (
          currentPage.map((product) => (
            <RouterProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-border bg-card px-6 py-14 text-center">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              No routers match these filters
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try clearing a few filters or broadening the search to see more products.
            </p>
          </div>
        )}
      </div>

      {filtered.length > PAGE_SIZE ? (
        <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {pageCount}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
              disabled={pageIndex === 0}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPageIndex((current) => Math.min(pageCount - 1, current + 1))
              }
              disabled={pageIndex >= pageCount - 1}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
