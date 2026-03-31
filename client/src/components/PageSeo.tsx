import { useEffect } from "react";
import { SITE_NAME, SITE_URL } from "../config/site";

const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1490474418585-ba9b8b1a404d?auto=format&fit=crop&w=1200&q=80";

type Props = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogType?: "website" | "product";
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function PageSeo({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  jsonLd,
  ogType = "website",
}: Props) {
  useEffect(() => {
    document.documentElement.lang = "zh-Hant";

    const fullTitle = title.includes(SITE_NAME) ? title : `${title}｜${SITE_NAME}`;
    document.title = fullTitle;

    setMeta("name", "description", description);
    setMeta("name", "robots", noIndex ? "noindex,nofollow" : "index,follow");

    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image);
    setMeta("property", "og:locale", "zh_HK");

    const canonical = SITE_URL ? `${SITE_URL}${path === "" ? "/" : path}` : "";
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
      setMeta("property", "og:url", canonical);
    }

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    const scriptId = "rya-page-jsonld";
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    if (jsonLd) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [title, description, path, image, noIndex, jsonLd, ogType]);

  return null;
}
