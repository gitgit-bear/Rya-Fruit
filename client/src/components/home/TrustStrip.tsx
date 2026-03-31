export function TrustStrip() {
  const items = [
    { t: "每日新鮮製作", d: "現切現裝，風味更集中" },
    { t: "全程冷鏈思維", d: "冰包封箱＋保護外箱" },
    { t: "透明替換政策", d: "時令不佳即換同等價值果物" },
    { t: "送禮與企業團購", d: "可配檔期安排與禮贈需求" },
  ];

  return (
    <section className="trust-strip" aria-label="信任標章">
      <div className="container">
        <ul className="trust-strip-grid">
          {items.map((x) => (
            <li key={x.t} className="trust-strip-item">
              <strong>{x.t}</strong>
              <span>{x.d}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
