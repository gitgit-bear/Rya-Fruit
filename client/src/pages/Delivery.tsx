import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageSeo } from "../components/PageSeo";
import { fetchDeliveryConfig } from "../api/client";
import type { DeliveryConfig } from "../types/delivery";

export function Delivery() {
  const [cfg, setCfg] = useState<DeliveryConfig | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDeliveryConfig()
      .then(setCfg)
      .catch(() => setErr("暫時無法載入配送設定，請稍後再試。"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageSeo
        title="配送與檔期"
        description="Rya Fruit 配送範圍、免運門檻、截單時間與送達時段說明。"
        path="/delivery"
      />
      <section className="section page-pad">
        <div className="container delivery-grid">
          <div>
            <header className="section-head section-head-left">
              <p className="section-eyebrow">送達與免運</p>
              <h1 className="section-title">清楚預期，才好安排重要時刻</h1>
              <p className="section-lead">
                以下為你在下單前需要知道嘅配送標準。正式訂單以結帳表單顯示為準。
              </p>
            </header>

            {loading && <p className="muted">載入中…</p>}
            {err && <p className="error-banner">{err}</p>}

            {cfg && (
              <ul className="delivery-list delivery-list-v2">
                <li>
                  <strong>免運門檻</strong>：單筆滿 <strong>${cfg.settings.freeShipThreshold}</strong>（一般地區）免運。
                </li>
                <li>
                  <strong>截單時間</strong>：每天 <strong>{cfg.settings.cutOffTime}</strong> 之前提交，安排同日到貨路線；
                  之後多數訂單以次日安排（視路線與檔期）。
                </li>
                <li>
                  <strong>配送時段</strong>：{cfg.settings.timeSlots.join("、")}
                </li>
                <li>
                  <strong>包裝思維</strong>：以保護外箱＋保冷配置出貨，降低溫度變化對風味的影響。
                </li>
                <li>
                  <strong>不可抗力</strong>：惡劣天氣或突發狀況可能延遲，我們會主動通知。
                </li>
              </ul>
            )}

            {cfg && (
              <section className="section-tight" style={{ marginTop: "1.6rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.15rem" }}>配送區域</h2>
                <ul className="delivery-list" style={{ marginTop: "0.75rem" }}>
                  {cfg.zones.map((z) => (
                    <li key={z.id}>
                      <strong>{z.name}</strong>
                      {z.fee > 0 ? ` · 配送費 ${z.fee}` : " · 一般情況免運"}
                      {z.note ? <span className="muted">（{z.note}）</span> : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="delivery-card delivery-card-v2">
            <h2 className="delivery-card-title">送達節奏</h2>
            <p className="delivery-highlight">今日下單 · 多數翌日送達</p>
            <p className="muted">
              依配送區域與當日檔期調整。若你有重要場次，建議提早預訂；更多詳情見結帳表單與客服回覆。
            </p>
            <p className="muted" style={{ marginTop: "1rem", lineHeight: 1.7 }}>
              {cfg?.settings.note || ""}
            </p>

            <div style={{ marginTop: "1.25rem" }}>
              <Link to="/products" className="btn btn-primary btn-block btn-lg">
                立即選購
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
