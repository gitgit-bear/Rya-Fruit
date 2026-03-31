import { Link } from "react-router-dom";

export function HeroSection({ featuredImageUrl }: { featuredImageUrl?: string }) {
  return (
    <section className="hero hero-v2">
      <div className="container hero-v2-grid">
        <div className="hero-v2-copy">
          <p className="hero-kicker">香港 · 御選時令生果</p>
          <h1 className="hero-title">
            讓每一口，
            <span className="hero-title-accent">新鮮得體面</span>
          </h1>
          <p className="hero-sub">
            生果杯每日現切現裝，冷鏈配送保留鮮脆與香甜。無論是辦公午茶、週末聚會或心意禮贈，Rya Fruit
            為你呈獻可見、可聞、可信任的新鮮。
          </p>
          <ul className="hero-bullets" aria-label="品牌承諾">
            <li>當日製作 · 全程衛生流程</li>
            <li>滿額免運 · 最快翌日送達</li>
            <li>時令替換 · 同等價值保證</li>
          </ul>
          <div className="hero-cta-row">
            <Link to="/products" className="btn btn-primary btn-lg">
              今日就揀定
            </Link>
            <Link to="/delivery" className="btn btn-secondary btn-lg">
              免運門檻與檔期
            </Link>
          </div>
          <p className="hero-note">
            首次購買建議：先從<span className="text-accent">御選生果杯</span>開始，再搭一杯慢萃果汁更完美。
          </p>
        </div>
        <div className="hero-v2-visual" aria-hidden="true">
          <div className="hero-v2-card">
            <div className="hero-v2-glow" />
            <img
              className="hero-v2-photo"
              src={
                featuredImageUrl ??
                "https://images.unsplash.com/photo-1490474418585-ba9b8b1a404d?auto=format&fit=crop&w=1200&q=80"
              }
              alt=""
              loading="eager"
              decoding="async"
            />
            <p className="hero-v2-caption">今日精選 · 現切配送</p>
          </div>
        </div>
      </div>
    </section>
  );
}
