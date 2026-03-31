import assert from "node:assert/strict";
import test from "node:test";

import { catalogItemToRouterProduct, type AmazonCatalogItem } from "../lib/amazon-catalog.ts";

test("catalogItemToRouterProduct maps Amazon catalog data into router product fields", () => {
  const item: AmazonCatalogItem = {
    asin: "B0TEST1234",
    title: "TP-Link Archer BE550 Tri-Band WiFi 7 Router Covers up to 2800 sq ft and 100 devices",
    brand: "TP-Link",
    price: 249.99,
    currency: "USD",
    imageUrl: "https://m.media-amazon.com/images/I/example.jpg",
    features: ["WPA3 Security", "Beamforming", "Guest Network"],
    browseNodeNames: ["Electronics", "Routers"],
    customerReviewRating: 4.4,
  };

  const product = catalogItemToRouterProduct(item, 0);

  assert.equal(product.asin, "B0TEST1234");
  assert.equal(product.brand, "TP-Link");
  assert.equal(product.wifi, "WiFi 7");
  assert.equal(product.frequencyBandClass, "Tri-Band");
  assert.equal(product.coverage, "2800");
  assert.equal(product.devices, "100");
  assert.ok(product.specialFeatures.includes("Beamforming"));
  assert.ok(product.securityProtocols.includes("WPA3"));
});
