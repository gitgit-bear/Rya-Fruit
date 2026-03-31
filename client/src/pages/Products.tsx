import { useEffect, useState } from "react";
import { PageSeo } from "../components/PageSeo";
import { fetchProducts } from "../api/client";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";

export function Products() {
  const [list, setList] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(setList)
      .catch(() => setErr("暫時無法載入商品，請稍後再試。"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageSeo
        title="全部商品"
        description="瀏覽 Rya Fruit 御選生果杯、聚會果盤、冷萃果汁與季節限定。每日新鮮製作，滿額免運，最快翌日送達。"
        path="/products"
      />
      <section className="section page-pad">
        <div className="container">
          <header className="section-head section-head-left">
            <p className="section-eyebrow">線上選購</p>
            <h1 className="section-title">全部商品</h1>
            <p className="section-lead">
              從入門果杯到盛宴果盤，每款皆附賣點標示與清楚價格；加入購物車後可於結帳時聯絡確認檔期。
            </p>
          </header>
          {loading && <p className="muted">載入中…</p>}
          {err && <p className="error-banner">{err}</p>}
          {!loading && !err && (
            <div className="product-grid">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
