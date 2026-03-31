import { Link } from "react-router-dom";

export function FinalCtaSection() {
  return (
    <section className="final-cta">
      <div className="container final-cta-inner">
        <div>
          <h2 className="final-cta-title">今日下單，明天就想開杯？</h2>
          <p className="final-cta-desc">
            從御選生果杯開始，把「鮮、甜、清爽」一次帶到辦公室或家中。全站滿 $500 免運（偏遠地區除外），提交後由客服按檔期即時回覆確認。
          </p>
        </div>
        <div className="final-cta-actions">
          <Link to="/products" className="btn btn-light btn-lg">
            立即選購
          </Link>
          <Link to="/contact" className="btn btn-ghost-light btn-lg">
            企業／大量洽詢
          </Link>
        </div>
      </div>
    </section>
  );
}
