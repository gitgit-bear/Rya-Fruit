import { Link } from "react-router-dom";
import type { Product } from "../../types/product";
import { useCart } from "../../contexts/CartContext";

type Bundle = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  a: string; // productId
  b: string; // productId
  cta: string;
};

const bundles: Bundle[] = [
  {
    id: "bundle-signature",
    title: "首購經典搭配",
    subtitle: "一杯現切果香 + 一杯冷萃果香，風味更完整。",
    icon: "🥤",
    a: "fresh-fruit-cup",
    b: "cold-press-juice",
    cta: "一鍵加購套裝",
  },
  {
    id: "bundle-party",
    title: "聚會更體面",
    subtitle: "分享果盤作主角，再配冷萃果汁更好招待。",
    icon: "🍇",
    a: "party-fruit-platter",
    b: "juice-mango",
    cta: "一鍵加購套裝",
  },
  {
    id: "bundle-afternoon",
    title: "午後輕奢組合",
    subtitle: "單人果盤剛剛好，配柑橘冷萃更清爽。",
    icon: "🍊",
    a: "deluxe-platter",
    b: "juice-citrus",
    cta: "一鍵加購套裝",
  },
];

function byId(list: Product[], id: string) {
  return list.find((p) => p.id === id);
}

export function BundleSection({ products }: { products: Product[] }) {
  const { add } = useCart();

  const resolved = bundles
    .map((b) => {
      const a = byId(products, b.a);
      const c = byId(products, b.b);
      if (!a || !c) return null;
      const total = a.price + c.price;
      return { ...b, a, c, total };
    })
    .filter(Boolean) as Array<Bundle & { a: Product; c: Product; total: number }>;

  return (
    <section className="section section-tight bundle-section" id="bundles">
      <div className="container">
        <header className="section-head section-head-left">
          <p className="section-eyebrow">更省心的搭配</p>
          <h2 className="section-title">同時下單，讓風味一次到位</h2>
          <p className="section-lead">
            適合首購、送禮同聚會。把「想吃的」與「想搭配的」直接一鍵配好，節省你猶豫的時間。
          </p>
        </header>

        <div className="bundle-grid">
          {resolved.map((b) => (
            <div key={b.id} className="bundle-card">
              <div className="bundle-top">
                <span className="bundle-icon" aria-hidden>
                  {b.icon}
                </span>
                <div>
                  <h3 className="bundle-title">{b.title}</h3>
                  <p className="bundle-sub">{b.subtitle}</p>
                </div>
              </div>

              <div className="bundle-items">
                <div className="bundle-item">
                  <img
                    className="bundle-thumb"
                    src={b.a.imageUrl}
                    alt={b.a.name}
                    loading="lazy"
                    decoding="async"
                    width={120}
                    height={90}
                  />
                  <span className="bundle-item-label">主食</span>
                  <strong>{b.a.name}</strong>
                  <span className="bundle-item-price">${b.a.price}</span>
                </div>
                <div className="bundle-item">
                  <img
                    className="bundle-thumb"
                    src={b.c.imageUrl}
                    alt={b.c.name}
                    loading="lazy"
                    decoding="async"
                    width={120}
                    height={90}
                  />
                  <span className="bundle-item-label">加購</span>
                  <strong>{b.c.name}</strong>
                  <span className="bundle-item-price">${b.c.price}</span>
                </div>
              </div>

              <div className="bundle-total">
                套裝參考總額：<strong>${b.total}</strong>
              </div>

              <div className="bundle-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-block"
                  onClick={() => {
                    add(b.a);
                    add(b.c);
                  }}
                >
                  {b.cta}
                </button>
                <Link to="/products" className="btn btn-ghost btn-lg btn-block">
                  我想自己揀
                </Link>
              </div>
            </div>
          ))}

          {resolved.length === 0 && (
            <p className="muted">目前尚未設定套裝商品，請稍後再試或在後台更新產品。</p>
          )}
        </div>
      </div>
    </section>
  );
}

