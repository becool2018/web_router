import React from "react";

import type { Product } from "./catalog";

function renderReviewList(
  heading: string,
  items: Product["reviewCollection"]["youtubeReviews"]
) {
  return React.createElement(
    "section",
    { "data-heading": heading },
    React.createElement("h3", null, heading),
    items.length
      ? React.createElement(
          "ul",
          null,
          ...items.map((item) =>
            React.createElement(
              "li",
              { key: `${heading}-${item.url}` },
              React.createElement("a", { href: item.url }, item.title),
              React.createElement("span", null, item.sourceName)
            )
          )
        )
      : React.createElement("p", null, "No reviews yet.")
  );
}

export function RouterCardView({ product }: { product: Product }) {
  return React.createElement(
    "article",
    { "data-product-id": product.id },
    React.createElement("h2", null, `${product.brand} ${product.model}`),
    React.createElement(
      "p",
      null,
      `Amazon affiliate link for ${product.asin}`
    ),
    renderReviewList("YouTube Reviews", product.reviewCollection.youtubeReviews),
    renderReviewList("Article Reviews", product.reviewCollection.articleReviews)
  );
}
