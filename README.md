This is a Next.js storefront for wireless routers that combines:

- router specs and pricing
- YouTube review links for each product
- third-party article review links
- Amazon affiliate buy buttons

The current version stays intentionally simple: one page, one local data layer, and a lightweight review refresh script.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the storefront by modifying `app/page.tsx` and the catalog/review files in `lib/` and `data/`.

## Environment

Set your Amazon affiliate tag when you have one:

```bash
AMAZON_AFFILIATE_TAG=yourtag-20
```

For automated review refreshes, the update script expects:

```bash
YOUTUBE_API_KEY=...
SERPAPI_API_KEY=...
```

For Amazon catalog imports, set:

```bash
AMAZON_AFFILIATE_TAG=yourtag-20
AMAZON_PAAPI_ACCESS_KEY=...
AMAZON_PAAPI_SECRET_KEY=...
AMAZON_PAAPI_HOST=webservices.amazon.com
AMAZON_PAAPI_REGION=us-east-1
AMAZON_PAAPI_MARKETPLACE=www.amazon.com
```

Then run:

```bash
npm run catalog:import
npm run reviews:update
```

This importer writes Amazon-backed product data to `data/router-catalog.json`. The storefront automatically prefers that imported catalog over the static fallback list in `lib/routers.ts`.

Then `npm run reviews:update` updates `data/router-reviews.json` with normalized review metadata while preserving manual exclusions.

Note: Amazon’s public Product Advertising API docs say PA-API 5.0 is being deprecated on April 30, 2026 in favor of Creators API. This project’s importer is structured so you can swap the transport later, but today it uses the currently documented affiliate product API flow.

## Testing

Run:

```bash
npm test
```

The test suite covers:

- Amazon affiliate URL generation
- Amazon catalog item normalization
- review normalization and deduping
- a render-level check for a product card with mixed review content

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
