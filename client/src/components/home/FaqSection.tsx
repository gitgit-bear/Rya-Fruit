import { useState } from "react";

const faqs = [
  {
    q: "水果內容會跟圖片完全一樣嗎？",
    a: "生果屬天然產品，會依當日供應與季節微調外觀與配色；但我們會以同等價值果物替換，確保整體風味、份量與品質一致。",
  },
  {
    q: "最快幾時收到？",
    a: "一般以「今日下單、翌日配送」為主（依截單時間與路線而定）。遇上特殊狀況會由客服提早通知，讓你能安心安排時間。",
  },
  {
    q: "可以客製企業大量訂單嗎？",
    a: "可以。你可以在聯絡頁面留下日期、份量與預算，我們會由專人整理可供應品項與檔期，回覆你更適合的方案。",
  },
  {
    q: "如何保存生果杯？",
    a: "收貨後建議儘快冷藏於 0–4°C，並於 24 小時內享用完畢。若你有備註需求（如「需先打電話」），也可在結帳備註告訴我們。",
  },
  {
    q: "滿額免運門檻是多少？",
    a: "滿額免運門檻會依配送設定計算。你可以直接在購物車結帳頁查看「距離免運尚差多少」，更直覺好下決定。",
  },
  {
    q: "提交後可否更改配送資料？",
    a: "可以。提交後我們會先按你填寫的配送資訊進行檔期確認；如需調整地址或時段，請盡快聯絡客服，我們會盡量配合。",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section section-alt faq-section" id="faq">
      <div className="container narrow-lg">
        <header className="section-head">
          <p className="section-eyebrow">常見問題</p>
          <h2 className="section-title">購買前，你可能想先知道</h2>
        </header>
        <div className="faq-list">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`faq-item${isOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {item.q}
                  <span className="faq-icon" aria-hidden>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && <p className="faq-a">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
