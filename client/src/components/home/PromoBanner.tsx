import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const KEY = "rya_promo_banner_v1";

export function PromoBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem(KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  if (hidden) return null;

  return (
    <div className="promo-banner" role="region" aria-label="期間優惠">
      <div className="promo-banner-inner container">
        <p className="promo-banner-text">
          <span className="promo-banner-badge">限時</span>
          全站單筆滿 $500 享免運優惠（偏遠地區除外）· 今日下單最快翌日送達
        </p>
        <div className="promo-banner-actions">
          <Link to="/products" className="promo-banner-link">
            立即選購
          </Link>
          <button
            type="button"
            className="promo-banner-dismiss"
            aria-label="關閉優惠列"
            onClick={() => {
              try {
                sessionStorage.setItem(KEY, "1");
              } catch {
                /* ignore */
              }
              setHidden(true);
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
