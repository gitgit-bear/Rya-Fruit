const steps = [
  { n: "01", t: "線上選品", d: "挑選果杯／果盤／加購飲品，加入購物車。" },
  { n: "02", t: "確認檔期與付款", d: "提交訂單意向後，客服會按你選定嘅配送資訊回覆確認付款安排。" },
  { n: "03", t: "新鮮製作", d: "訂單彙整後現切現裝，冰包封箱，確保風味狀態。" },
  { n: "04", t: "冷鏈送達", d: "按配送路線安排最快翌日送達；建議收貨後盡快冷藏享用。" },
];

export function OrderFlowSection() {
  return (
    <section className="section section-alt flow-section">
      <div className="container">
        <header className="section-head">
          <p className="section-eyebrow">下單流程</p>
          <h2 className="section-title">四步，把果園的新鮮送到你手邊</h2>
        </header>
        <ol className="flow-steps">
          {steps.map((s) => (
            <li key={s.n} className="flow-step">
              <span className="flow-step-num">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
