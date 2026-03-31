import { Link } from "react-router-dom";
import type { Product } from "../types/product";
import { BADGE_LABELS, type ProductBadgeKey } from "../types/product";
import { useCart } from "../contexts/CartContext";

type Props = { product: Product };

function badgeLabel(badge: string | undefined): string | null {
  if (!badge) return null;
  return BADGE_LABELS[badge as ProductBadgeKey] ?? null;
}

export function ProductCard({ product }: Props) {
  const { add, lines } = useCart();
  const label = badgeLabel(product.badge);
  const hasCompare =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const qty = lines.find((l) => l.product.id === product.id)?.qty ?? 0;
  const isAdded = qty > 0;

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-media">
        {label && (
          <span className="product-card-badge" data-badge={product.badge}>
            {label}
          </span>
        )}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={800}
          height={600}
        />
      </Link>
      <div className="product-card-body">
        <span className="product-card-tag">{product.tag}</span>
        <h3>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        {product.highlight && <p className="product-card-highlight">{product.highlight}</p>}
        <p className="product-card-desc">{product.description}</p>
        <div className="product-card-footer">
          <div className="product-card-priceblock">
            <div className="product-card-prices">
              <span className="product-card-price">${product.price}</span>
              {hasCompare && (
                <span className="product-card-compare">${product.compareAtPrice}</span>
              )}
            </div>
            <span className="product-card-unit">起</span>
          </div>
          <button
            type="button"
            className={`btn btn-primary btn-cart${isAdded ? " is-added" : ""}`}
            onClick={() => {
              add(product);
              window.dispatchEvent(new Event("rya-fruit:open-cart"));
            }}
          >
            {isAdded ? `已加入（${qty}）` : "加入購物車"}
          </button>
        </div>
      </div>
    </article>
  );
}
