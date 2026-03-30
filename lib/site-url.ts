/**
 * Canonical origin for metadata, JSON-LD, and absolute asset URLs.
 *
 * Empty or whitespace `NEXT_PUBLIC_SITE_URL` must not be passed to `new URL()` —
 * `""` is not nullish, so `??` does not apply and would throw at runtime (HTTP 500).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw.replace(/\/$/, "");
    }
    return `https://${raw.replace(/\/$/, "")}`;
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

/** Safe `URL` for `metadataBase` — never throws */
export function getMetadataBase(): URL {
  try {
    return new URL(`${getSiteUrl()}/`);
  } catch {
    return new URL("http://localhost:3000/");
  }
}
