export function WhyChooseSection() {
  const blocks = [
    {
      title: "嚴選當造，不硬銷反季",
      text: "我們依產地與糖度挑果，寧缺勿濫；若遇貨源波動，會主動以同等價值果物替換並於說明中標示。",
    },
    {
      title: "輕奢體驗，不花俏包裝",
      text: "外包裝以保護與保冷為優先，內在才是主角 — 讓預算留在水果本身，送禮自用都體面。",
    },
    {
      title: "流程可視化，安心可追溯",
      text: "從清洗、切配到裝杯，遵循衛生標準；配送附冰包，降低溫度變化對風味的影響。",
    },
  ];

  return (
    <section className="section section-alt why-section">
      <div className="container">
        <header className="section-head">
          <p className="section-eyebrow">為何選擇 Rya Fruit</p>
          <h2 className="section-title">不是多賣一杯，而是多留一份信任</h2>
        </header>
        <div className="why-grid">
          {blocks.map((b) => (
            <article key={b.title} className="why-card">
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
