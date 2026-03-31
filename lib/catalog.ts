import routerReviews from "../data/router-reviews.json";

import { IMPORTED_ROUTERS } from "./amazon-catalog";
import { ROUTERS, type RouterProduct } from "./routers";
import { DEFAULT_REVIEW_SEARCH_CONFIG, type ReviewCollection } from "./reviews";

export type ProductCategory = "router";

export type Product = RouterProduct & {
  category: ProductCategory;
  reviewCollection: ReviewCollection;
};

type RouterReviewMap = Record<string, ReviewCollection | undefined>;

const reviewMap = routerReviews as RouterReviewMap;
const routerSource = IMPORTED_ROUTERS.length ? IMPORTED_ROUTERS : ROUTERS;

function getReviewCollection(routerId: number): ReviewCollection {
  const entry = reviewMap[String(routerId)];

  return {
    youtubeReviews: entry?.youtubeReviews?.slice(0, DEFAULT_REVIEW_SEARCH_CONFIG.youtubeLimit) ?? [],
    articleReviews: entry?.articleReviews?.slice(0, DEFAULT_REVIEW_SEARCH_CONFIG.articleLimit) ?? [],
    lastReviewedAt: entry?.lastReviewedAt,
    manualExcludedUrls: entry?.manualExcludedUrls ?? [],
  };
}

export const PRODUCTS: Product[] = routerSource.map((router) => ({
  ...router,
  category: "router",
  reviewCollection: getReviewCollection(router.id),
}));

export function getProductById(id: number): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}
