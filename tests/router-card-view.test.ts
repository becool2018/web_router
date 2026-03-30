import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { RouterCardView } from "../lib/router-card-view.ts";

test("RouterCardView renders a product with youtube and article review sections", () => {
  const html = renderToStaticMarkup(
    React.createElement(RouterCardView, {
      product: {
        id: 99,
        asin: "B012345678",
        brand: "TP-Link",
        model: "Archer Test",
        wifi: "WiFi 7",
        speed: "10.0",
        coverage: "3000",
        devices: "120",
        price: 299.99,
        routerType: "traditional",
        thumbnailUrl: "/router-placeholder.svg",
        specialFeatures: ["Beamforming"],
        frequencyBandClass: "Tri-Band",
        customerReviewRating: 4,
        antennaType: "Fixed",
        maxDownloadMbps: 2000,
        maxUploadMbps: 500,
        securityProtocols: ["WPA3"],
        todaysDeal: false,
        primeEligible: true,
        sameDayBy10pm: false,
        overnightBy8am: false,
        deliveryArrivalDay: "tomorrow",
        addOnDelivery: false,
        category: "router",
        reviewCollection: {
          youtubeReviews: [
            {
              kind: "youtube",
              title: "Archer Test Review",
              url: "https://www.youtube.com/watch?v=abc123",
              sourceName: "Router Channel",
            },
          ],
          articleReviews: [
            {
              kind: "article",
              title: "Archer Test article review",
              url: "https://www.techradar.com/reviews/archer-test",
              sourceName: "TechRadar",
            },
          ],
          lastReviewedAt: "2026-03-30",
        },
      },
    })
  );

  assert.match(html, /TP-Link Archer Test/);
  assert.match(html, /YouTube Reviews/);
  assert.match(html, /Article Reviews/);
  assert.match(html, /Archer Test Review/);
  assert.match(html, /Archer Test article review/);
});
