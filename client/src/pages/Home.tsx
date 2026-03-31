import { lazy, Suspense, useEffect, useState } from "react";
import { PageSeo } from "../components/PageSeo";
import { PromoBanner } from "../components/home/PromoBanner";
import { HeroSection } from "../components/home/HeroSection";
import { MicroNotice } from "../components/home/MicroNotice";
import { TrustStrip } from "../components/home/TrustStrip";
import { BestsellerSection } from "../components/home/BestsellerSection";
import { WhyChooseSection } from "../components/home/WhyChooseSection";
import { OccasionSection } from "../components/home/OccasionSection";
import { OrderFlowSection } from "../components/home/OrderFlowSection";
import { FinalCtaSection } from "../components/home/FinalCtaSection";
import { BundleSection } from "../components/home/BundleSection";
import { fetchProducts } from "../api/client";
import type { Product } from "../types/product";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "../config/site";

const TestimonialsSection = lazy(async () => ({
  default: (await import("../components/home/TestimonialsSection")).TestimonialsSection,
}));
const FaqSection = lazy(async () => ({
  default: (await import("../components/home/FaqSection")).FaqSection,
}));

function SectionFallback() {
  return (
    <div className="section section-tight">
      <div className="container">
        <p className="muted skeleton-line">載入更多內容…</p>
      </div>
    </div>
  );
}

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() =>
        setErr("暫時無法載入商品資料，請稍後再試或確認網路連線。")
      );
  }, []);

  const orgJsonLd: Record<string, unknown> | undefined = SITE_URL
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/#org`,
            name: SITE_NAME,
            description: SITE_TAGLINE,
            url: SITE_URL,
            logo: `${SITE_URL}/logo-512.png`,
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: SITE_NAME,
            url: SITE_URL,
            publisher: { "@id": `${SITE_URL}/#org` },
          },
        ],
      }
    : undefined;

  return (
    <>
      <PageSeo
        title={`${SITE_NAME}｜御選生果杯 · 禮贈果盤`}
        description="Rya Fruit 御選時令生果：每日現切生果杯、聚會果盤與冷萃果汁。冷鏈配送、滿額免運，適合辦公午茶、送禮與家庭分享。"
        path="/"
        image={products.find((p) => p.badge === "bestseller")?.imageUrl}
        jsonLd={orgJsonLd || undefined}
      />
      <PromoBanner />
      <HeroSection featuredImageUrl={products.find((p) => p.badge === "bestseller")?.imageUrl} />
      <MicroNotice />
      <TrustStrip />
      <BestsellerSection products={products} error={err} />
      <BundleSection products={products} />
      <WhyChooseSection />
      <OccasionSection />
      <OrderFlowSection />
      <Suspense fallback={<SectionFallback />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FaqSection />
      </Suspense>
      <FinalCtaSection />
    </>
  );
}
