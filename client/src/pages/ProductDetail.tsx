import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProduct } from "../api/client";
import type { Product } from "../types/product";
import { BADGE_LABELS, type ProductBadgeKey } from "../types/product";
import { useCart } from "../contexts/CartContext";
import { PageSeo } from "../components/PageSeo";
import { SITE_NAME, SITE_URL } from "../config/site";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { add, lines } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id)
      .then(setP)
      .catch(() => setErr("找不到此商品或暫時無法載入。"));
  }, [id]);

  if (err || !id) {
    return (
      <>
        <PageSeo
          title="找不到商品"
          description="您瀏覽的商品不存在或已下架。"
          path="/products"
          noIndex
        />
        <section className="section page-pad">
          <div className="container narrow">
            <p className="error-banner">{err || "連結無效"}</p>
            <Link to="/products" className="btn btn-primary">
              返回全部商品
            </Link>
          </div>
        </section>
      </>
    );
  }

  if (!p) {
    return (
      <section className="section page-pad">
        <div className="container">
          <p className="muted">載入中…</p>
        </div>
      </section>
    );
  }

  const badgeLabel = p.badge ? BADGE_LABELS[p.badge as ProductBadgeKey] : null;
  const qty = lines.find((l) => l.product.id === p.id)?.qty ?? 0;
  const isAdded = qty > 0;
  const hasCompare =
    p.compareAtPrice != null && p.compareAtPrice > p.price;

  const descShort = p.description.length > 160 ? `${p.description.slice(0, 157)}…` : p.description;

  const productJsonLd =
    SITE_URL &&
    ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.description,
      image: p.imageUrl,
      brand: { "@type": "Brand", name: SITE_NAME },
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/products/${p.id}`,
        priceCurrency: "HKD",
        price: p.price,
        availability: "https://schema.org/InStock",
      },
    } as Record<string, unknown>);

  return (
    <>
      <PageSeo
        title={p.name}
        description={descShort}
        path={`/products/${p.id}`}
        image={p.imageUrl}
        ogType="product"
        jsonLd={productJsonLd || undefined}
      />
      <section className="section page-pad product-detail-page">
        <div className="container">
          <nav className="breadcrumb" aria-label="麵包屑">
            <Link to="/">主頁</Link>
            <span className="breadcrumb-sep" aria-hidden="true">
              /
            </span>
            <Link to="/products">全部商品</Link>
            <span className="breadcrumb-sep" aria-hidden="true">
              /
            </span>
            <span className="breadcrumb-current">{p.name}</span>
          </nav>
          <div className="detail-grid">
            <div className="detail-media">
              {badgeLabel && (
                <span className="detail-badge" data-badge={p.badge}>
                  {badgeLabel}
                </span>
              )}
              <img src={p.imageUrl} alt={p.name} width={1200} height={900} loading="eager" />
            </div>
            <div className="detail-copy">
              <p className="eyebrow">{p.tag}</p>
              <h1>{p.name}</h1>
              {p.highlight && <p className="detail-highlight">{p.highlight}</p>}
              <div className="detail-price-row">
                <span className="detail-price">${p.price}</span>
                {hasCompare && (
                  <span className="detail-compare">${p.compareAtPrice}</span>
                )}
              </div>
              <p className="detail-desc">{p.description}</p>
              <div className="detail-actions">
                <button
                  type="button"
                  className={`btn btn-primary btn-lg${isAdded ? " is-added" : ""}`}
                  onClick={() => {
                    add(p);
                    window.dispatchEvent(new Event("rya-fruit:open-cart"));
                  }}
                >
                  {isAdded ? `已加入（${qty}）` : "加入購物車"}
                </button>
                <Link to="/products" className="btn btn-secondary btn-lg">
                  繼續逛商品
                </Link>
              </div>
              <ul className="detail-trust" aria-label="購買說明">
                <li>冷鏈配送思維 · 附冰包建議</li>
                <li>時令微調時，以同等價值替換</li>
                <li>收貨後請儘快冷藏並於 24 小時內享用</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
