import { RouterJsonLd } from "@/components/router-json-ld";
import { RouterStorefront } from "@/components/router-storefront";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <RouterJsonLd />
      <div className="bg-background text-foreground flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-3 py-4 sm:px-4 sm:py-6">
          <RouterStorefront />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
