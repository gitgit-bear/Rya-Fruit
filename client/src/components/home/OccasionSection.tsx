import { Link } from "react-router-dom";

const occasions = [
  {
    title: "辦公午茶",
    desc: "一人一杯剛剛好。會議後補一口新鮮，甜度平衡又清爽，唔會膩住。",
    to: "/products",
  },
  {
    title: "週末聚會",
    desc: "大份量果盤上桌即亮點。分享剛剛好，拍照也上鏡。",
    to: "/products",
  },
  {
    title: "送禮心意",
    desc: "精緻份量與當季配色。比花束更實在，拆開即食更有心。",
    to: "/products",
  },
  {
    title: "產後／探病慰問",
    desc: "口感溫和易入口。可於備註交代偏好（視當日供應），由客服協助安排。",
    to: "/contact",
  },
];

export function OccasionSection() {
  return (
    <section className="section occasion-section">
      <div className="container">
        <header className="section-head section-head-left">
          <p className="section-eyebrow">場景推薦</p>
          <h2 className="section-title">按場景揀，3 分鐘搞掂下單</h2>
          <p className="section-lead">先想清楚「誰要吃、什麼時候到、怎麼分享」，你會發現選擇變得好簡單。</p>
        </header>
        <div className="occasion-grid">
          {occasions.map((o) => (
            <Link key={o.title} to={o.to} className="occasion-card">
              <h3>{o.title}</h3>
              <p>{o.desc}</p>
              <span className="occasion-card-cta">立即選購 →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
