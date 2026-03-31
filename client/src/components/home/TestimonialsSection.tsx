const reviews = [
  {
    quote: "果杯甜度平衡，同事以為是飯店下午茶。已經第三次團購。",
    name: "Karen L.",
    tag: "中環 · 金融業",
  },
  {
    quote: "送禮當天朋友拍照傳給我，配色很上鏡，關鍵是真的新鮮。",
    name: "Jason W.",
    tag: "九龍塘 · 設計顧問",
  },
  {
    quote: "提子盤脆度驚艷，小孩一吃就問下次還能不能再買。",
    name: "Mimi C.",
    tag: "將軍澳 · 家長",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section testimonials-section" id="reviews">
      <div className="container">
        <header className="section-head">
          <p className="section-eyebrow">顧客真實回饋</p>
          <h2 className="section-title">他們因為信任，所以一試成主顧</h2>
          <p className="section-lead muted">
            我哋把最常聽到嘅好評整理成短句，幫你更快做決定。
          </p>
        </header>
        <div className="testimonial-grid">
          {reviews.map((r) => (
            <blockquote key={r.name} className="testimonial-card">
              <p className="testimonial-quote">「{r.quote}」</p>
              <footer>
                <cite className="testimonial-name">{r.name}</cite>
                <span className="testimonial-tag">{r.tag}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
