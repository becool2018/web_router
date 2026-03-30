"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Star } from "lucide-react";

import { RouterThumbnail } from "@/components/router-thumbnail";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { amazonLink } from "@/lib/amazon";
import {
  ANTENNA_TYPE_OPTIONS,
  formatMbps,
  formatValueScore,
  FREQUENCY_BAND_OPTIONS,
  matchesMaxDownloadBucket,
  DEALS_FILTER_OPTIONS,
  DELIVERY_DAY_FILTER_OPTIONS,
  matchesDeliveryDay,
  matchesPriceRange,
  matchesUploadBucket,
  MAX_DOWNLOAD_FILTER_OPTIONS,
  ROUTERS,
  SECURITY_PROTOCOL_OPTIONS,
  SPECIAL_FEATURE_OPTIONS,
  uniqueBrands,
  PRICE_RANGE_FILTER_OPTIONS,
  UPLOAD_SPEED_FILTER_OPTIONS,
  valueScorePer1kSqFt,
  type AntennaType,
  type FrequencyBandClass,
  type MaxDownloadSpeedFilter,
  type DealsFilter,
  type DeliveryDayFilter,
  type PriceRangeFilter,
  type RouterProduct,
  type RouterType,
  type SecurityProtocol,
  type SpecialFeature,
  type UploadSpeedFilter,
  type WifiStandard,
} from "@/lib/routers";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

type TypeFilter = "all" | RouterType;
type SpecialFeatureFilter = "all" | SpecialFeature;
type SecurityProtocolFilter = "all" | SecurityProtocol;
type FrequencyBandFilter = "all" | FrequencyBandClass;
type AntennaTypeFilter = "all" | AntennaType;

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
      <p className="text-muted-foreground text-xs font-semibold">{heading}</p>
      <div
        className="bg-muted flex flex-wrap gap-1 rounded-lg p-[3px]"
        role="tablist"
        aria-label={heading}
      >
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "h-[calc(100%-1px)] min-h-8 shrink-0 rounded-md border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onValueChange(o.value)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomerReviewStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center gap-px"
        role="img"
        aria-label={`${rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5 shrink-0 sm:size-4",
              i < rating
                ? "fill-amber-400 text-amber-500"
                : "fill-transparent text-muted-foreground/35"
            )}
            aria-hidden
          />
        ))}
      </span>
      <span className="text-muted-foreground font-mono text-xs tabular-nums">
        {rating}/5
      </span>
    </span>
  );
}

export function RoutersTable() {
  const brands = React.useMemo(() => uniqueBrands(ROUTERS), []);

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
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "valueScore", desc: false },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROUTERS.filter((r) => {
      if (q) {
        const hay = `${r.model} ${r.brand}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (brand !== "all" && r.brand !== brand) return false;
      if (wifi !== "all" && r.wifi !== wifi) return false;
      if (!matchesPriceRange(r.price, priceRangeFilter)) return false;
      if (dealsFilter === "todays" && !r.todaysDeal) return false;
      if (!matchesDeliveryDay(r, deliveryDayFilter)) return false;
      if (typeFilter !== "all" && r.routerType !== typeFilter) return false;
      if (
        specialFeatureFilter !== "all" &&
        !r.specialFeatures.includes(specialFeatureFilter)
      ) {
        return false;
      }
      if (
        securityProtocolFilter !== "all" &&
        !r.securityProtocols.includes(securityProtocolFilter)
      ) {
        return false;
      }
      if (
        frequencyBandFilter !== "all" &&
        r.frequencyBandClass !== frequencyBandFilter
      ) {
        return false;
      }
      if (
        antennaTypeFilter !== "all" &&
        r.antennaType !== antennaTypeFilter
      ) {
        return false;
      }
      if (
        downloadFilter !== "all" &&
        !matchesMaxDownloadBucket(r.maxDownloadMbps, downloadFilter)
      ) {
        return false;
      }
      if (
        uploadFilter !== "all" &&
        !matchesUploadBucket(r.maxUploadMbps, uploadFilter)
      ) {
        return false;
      }
      return true;
    });
  }, [
    search,
    brand,
    wifi,
    priceRangeFilter,
    dealsFilter,
    deliveryDayFilter,
    typeFilter,
    specialFeatureFilter,
    securityProtocolFilter,
    frequencyBandFilter,
    antennaTypeFilter,
    downloadFilter,
    uploadFilter,
  ]);

  const columns = React.useMemo<ColumnDef<RouterProduct>[]>(
    () => [
      {
        id: "model",
        accessorKey: "model",
        header: "Model",
        cell: ({ row }) => (
          <div className="flex max-w-[min(100vw-4rem,22rem)] items-center gap-2">
            <RouterThumbnail
              alt={row.original.model}
              src={row.original.thumbnailUrl}
            />
            <span className="min-w-0 truncate font-medium leading-tight">
              {row.original.model}
            </span>
          </div>
        ),
        enableSorting: true,
        sortingFn: (a, b) =>
          a.original.model.localeCompare(b.original.model, "en"),
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{String(getValue())}</span>
        ),
      },
      {
        id: "customerReview",
        accessorKey: "customerReviewRating",
        header: "Customer review",
        cell: ({ row }) => (
          <CustomerReviewStars rating={row.original.customerReviewRating} />
        ),
      },
      {
        accessorKey: "wifi",
        header: "WiFi standard",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums sm:text-sm">
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "frequencyBandClass",
        header: "Frequency band",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums sm:text-sm">
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "antennaType",
        header: "Antenna type",
        cell: ({ getValue }) => (
          <span className="text-xs sm:text-sm">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "speed",
        header: "Max speed (Gbps)",
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "maxDownloadMbps",
        header: "Max download",
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums sm:text-sm">
            {formatMbps(row.original.maxDownloadMbps)}
          </span>
        ),
      },
      {
        accessorKey: "maxUploadMbps",
        header: "Upload",
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums sm:text-sm">
            {formatMbps(row.original.maxUploadMbps)}
          </span>
        ),
      },
      {
        accessorKey: "coverage",
        header: "Coverage (sq ft)",
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">
            {Number.parseFloat(String(getValue()).replace(/,/g, "")).toLocaleString(
              "en-US"
            )}
          </span>
        ),
      },
      {
        accessorKey: "devices",
        header: "Max devices",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums sm:text-sm">
            {String(getValue())}
          </span>
        ),
      },
      {
        id: "specialFeatures",
        accessorFn: (row) => row.specialFeatures.join(", "),
        header: "Special features",
        cell: ({ row }) => (
          <span
            className="text-muted-foreground max-w-[min(100vw-6rem,18rem)] whitespace-normal text-xs leading-snug sm:max-w-[14rem]"
            title={row.original.specialFeatures.join(", ")}
          >
            {row.original.specialFeatures.join(", ")}
          </span>
        ),
        sortingFn: (a, b) =>
          a.original.specialFeatures.length - b.original.specialFeatures.length,
      },
      {
        id: "securityProtocols",
        accessorFn: (row) => row.securityProtocols.join(", "),
        header: "Security protocol",
        cell: ({ row }) => (
          <span
            className="text-muted-foreground max-w-[min(100vw-6rem,16rem)] whitespace-normal text-xs leading-snug sm:max-w-[12rem]"
            title={row.original.securityProtocols.join(", ")}
          >
            {row.original.securityProtocols.join(", ")}
          </span>
        ),
        sortingFn: (a, b) =>
          a.original.securityProtocols.length -
          b.original.securityProtocols.length,
      },
      {
        id: "todaysDeal",
        accessorKey: "todaysDeal",
        header: "Deal",
        cell: ({ row }) =>
          row.original.todaysDeal ? (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Today&apos;s Deal
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "price",
        header: "Current price",
        cell: ({ getValue }) => (
          <span className="font-semibold tabular-nums">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(Number(getValue()))}
          </span>
        ),
      },
      {
        id: "valueScore",
        accessorFn: (row) => valueScorePer1kSqFt(row),
        header: "Value score ($/1k sq ft)",
        cell: ({ row }) => {
          const v = valueScorePer1kSqFt(row.original);
          return (
            <span className="font-mono tabular-nums">
              {formatValueScore(v)}
            </span>
          );
        },
      },
      {
        id: "buy",
        header: "Buy on Amazon",
        enableSorting: false,
        cell: ({ row }) => (
          <a
            href={amazonLink(row.original.asin)}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "h-8 px-2.5 text-xs font-semibold whitespace-nowrap"
            )}
          >
            Amazon
          </a>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  React.useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [
    search,
    brand,
    wifi,
    priceRangeFilter,
    dealsFilter,
    deliveryDayFilter,
    typeFilter,
    specialFeatureFilter,
    securityProtocolFilter,
    frequencyBandFilter,
    antennaTypeFilter,
    downloadFilter,
    uploadFilter,
  ]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
        <div className="flex w-full shrink-0 flex-col gap-2 lg:max-w-sm">
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model or brand…"
              className="h-9 pl-8 font-mono text-sm"
              aria-label="Search routers"
            />
          </div>
          <div className="border-border bg-card/40 rounded-lg border p-3 sm:p-4">
            <DeliveryFilterTabs
              heading="Delivery Day"
              value={deliveryDayFilter}
              onValueChange={(v) =>
                setDeliveryDayFilter(v as DeliveryDayFilter)
              }
              options={DELIVERY_DAY_FILTER_OPTIONS}
            />
          </div>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <FilterSelect
            label="Brand"
            value={brand}
            onValueChange={setBrand}
            options={[
              { value: "all", label: "All brands" },
              ...brands.map((b) => ({ value: b, label: b })),
            ]}
          />
          <FilterSelect
            label="WiFi"
            value={wifi}
            onValueChange={(v) => setWifi(v as WifiStandard | "all")}
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
            onValueChange={(v) =>
              setPriceRangeFilter(v as PriceRangeFilter)
            }
            options={PRICE_RANGE_FILTER_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
          <FilterSelect
            label="Deals & Discounts"
            value={dealsFilter}
            onValueChange={(v) => setDealsFilter(v as DealsFilter)}
            options={DEALS_FILTER_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
          <FilterSelect
            label="Type"
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as TypeFilter)}
            options={[
              { value: "all", label: "All types" },
              { value: "mesh", label: "Mesh" },
              { value: "traditional", label: "Traditional" },
              { value: "travel", label: "Travel" },
              { value: "portable", label: "Portable" },
            ]}
          />
          <FilterSelect
            label="Special Features"
            value={specialFeatureFilter}
            onValueChange={(v) =>
              setSpecialFeatureFilter(v as SpecialFeatureFilter)
            }
            options={[
              { value: "all", label: "All features" },
              ...SPECIAL_FEATURE_OPTIONS.map((f) => ({
                value: f,
                label: f,
              })),
            ]}
          />
          <FilterSelect
            label="Security Protocol"
            value={securityProtocolFilter}
            onValueChange={(v) =>
              setSecurityProtocolFilter(v as SecurityProtocolFilter)
            }
            options={[
              { value: "all", label: "All protocols" },
              ...SECURITY_PROTOCOL_OPTIONS.map((p) => ({
                value: p,
                label: p,
              })),
            ]}
          />
          <FilterSelect
            label="Frequency Band Class"
            value={frequencyBandFilter}
            onValueChange={(v) =>
              setFrequencyBandFilter(v as FrequencyBandFilter)
            }
            options={[
              { value: "all", label: "All bands" },
              ...FREQUENCY_BAND_OPTIONS.map((b) => ({
                value: b,
                label: b,
              })),
            ]}
          />
          <FilterSelect
            label="Antenna Type"
            value={antennaTypeFilter}
            onValueChange={(v) =>
              setAntennaTypeFilter(v as AntennaTypeFilter)
            }
            options={[
              { value: "all", label: "All antenna types" },
              ...ANTENNA_TYPE_OPTIONS.map((a) => ({
                value: a,
                label: a,
              })),
            ]}
          />
          <FilterSelect
            label="Max Download Speed"
            value={downloadFilter}
            onValueChange={(v) =>
              setDownloadFilter(v as MaxDownloadSpeedFilter)
            }
            options={MAX_DOWNLOAD_FILTER_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
          <FilterSelect
            label="Upload Speed"
            value={uploadFilter}
            onValueChange={(v) => setUploadFilter(v as UploadSpeedFilter)}
            options={UPLOAD_SPEED_FILTER_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        Showing {filtered.length} router{filtered.length === 1 ? "" : "s"}
        {filtered.length !== ROUTERS.length ? ` (of ${ROUTERS.length})` : ""}
      </p>

      <div className="rounded-md border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "bg-muted/40 text-foreground h-9 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide",
                        header.column.id === "model" && "min-w-[200px]",
                        header.column.id === "customerReview" && "min-w-[120px]",
                        header.column.id === "specialFeatures" &&
                          "min-w-[140px] max-w-[18rem]",
                        header.column.id === "securityProtocols" &&
                          "min-w-[120px] max-w-[14rem]",
                        header.column.id === "buy" && "w-[1%] text-right"
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:underline"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="text-muted-foreground size-3.5" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/30 odd:bg-background even:bg-muted/10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "text-foreground px-2 py-1.5 text-sm",
                        cell.column.id === "buy" && "text-right"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  No routers match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 ? (
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-muted-foreground text-xs tabular-nums">
            Page {pageIndex + 1} of {pageCount}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
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
      <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
        {label}
      </span>
      <Select
        value={value}
        onValueChange={(v) => onValueChange(v ?? options[0]?.value ?? "all")}
      >
        <SelectTrigger size="sm" className="h-9 w-full min-w-0 sm:w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
