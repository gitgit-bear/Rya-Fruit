import { Link } from "react-router-dom";
import type { Product } from "../../types/product";
import { ProductCard } from "../ProductCard";

type Props = {
  products: Product[];
  error: string | null;
};

export function BestsellerSection({ products, error }: Props) {
  const badgeScore = (badge: Product["badge"]) => {
    switch (badge) {
      case "bestseller":
        return 50;
      case "popular":
        return 40;
      case "recommended":
        return 30;
      case "fresh":
        return 20;
      case "seasonal":
        return 15;
      case "limited":
        return 12;
      default:
        return 0;
    }
  };

  const sorted = [...products].sort((a, b) => {
    const ds = badgeScore(b.badge) - badgeScore(a.badge);
    if (ds !== 0) return ds;
    // If badge score ties, prefer items with highlight (often more sellable).
    const ah = a.highlight ? 1 : 0;
    const bh = b.highlight ? 1 : 0;
    return bh - ah;
  });

  return (
    <section className="section section-tight" id="bestsellers">
      <div className="container">
        <header className="section-head section-head-left">
          <p className="section-eyebrow">本週熱賣</p>
          <h2 className="section-title">回購率最高的御選之作</h2>
          <p className="section-lead">
            先想好你想要「甜、清爽、或體面送禮」？再直接揀最受歡迎的款式，讓決策更快、下單更安心。
          </p>
        </header>
        {error && <p className="error-banner">{error}</p>}
        {!error && (
          <div className="product-grid product-grid-tight">
            {sorted.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <div className="section-cta-row">
          <Link to="/products" className="btn btn-primary btn-lg">
            查看完整系列
          </Link>
        </div>
      </div>
    </section>
  );
}
