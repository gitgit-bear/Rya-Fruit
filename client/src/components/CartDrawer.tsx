import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { submitOrderRequest } from "../api/client";
import { fetchDeliveryConfig } from "../api/client";
import type { DeliveryConfig } from "../types/delivery";
import { ContactChannels } from "./ContactChannels";
import {
  contactWhatsAppUrl,
  openWhatsAppWithPrefill,
  whatsAppPrefillAfterOrderRequest,
} from "../config/site";

type Props = { open: boolean; onClose: () => void };

export function CartDrawer({ open, onClose }: Props) {
  const { lines, remove, total, count, clear } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const defaultDate = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [deliveryMinDate, setDeliveryMinDate] = useState(defaultDate);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    occasion: "辦公午茶",
    zoneId: "",
    deliveryDate: defaultDate,
    timeSlot: "12:00-14:00",
    address: "",
    note: "",
  });

  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryErr, setDeliveryErr] = useState<string | null>(null);

  // Lock body scroll while overlays are open to avoid iOS/Android layout shifting.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    // Prevent layout shift when hiding the scrollbar (common in Chrome/desktop browsers).
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !checkoutOpen) return;
    if (deliveryConfig) return;

    setDeliveryLoading(true);
    setDeliveryErr(null);
    fetchDeliveryConfig()
      .then((cfg) => {
        setDeliveryConfig(cfg);
        const zones = cfg.zones || [];
        const firstZone = zones[0]?.id ?? "";
        const timeSlots = cfg.settings.timeSlots || [];
        const now = new Date();
        const cutOff = cfg.settings.cutOffTime || "18:00";
        const [hh, mm] = cutOff.split(":").map((x) => Number(x));
        const cutOffDate = new Date(now);
        cutOffDate.setHours(hh || 18, mm || 0, 0, 0);
        const minDate = now.getTime() > cutOffDate.getTime() ? 1 : 0;
        const minDateDate = new Date(now);
        minDateDate.setDate(now.getDate() + minDate);
        const yyyy = minDateDate.getFullYear();
        const mm2 = String(minDateDate.getMonth() + 1).padStart(2, "0");
        const dd2 = String(minDateDate.getDate()).padStart(2, "0");
        const minDateStr = `${yyyy}-${mm2}-${dd2}`;
        setDeliveryMinDate(minDateStr);

        setForm((f) => ({
          ...f,
          zoneId: f.zoneId || firstZone,
          timeSlot: timeSlots.includes(f.timeSlot) ? f.timeSlot : timeSlots[0] || f.timeSlot,
          deliveryDate: f.deliveryDate < minDateStr ? minDateStr : f.deliveryDate,
        }));
      })
      .catch((e) => setDeliveryErr(e instanceof Error ? e.message : "載入配送設定失敗"))
      .finally(() => setDeliveryLoading(false));
  }, [open, checkoutOpen, deliveryConfig]);

  const freeShipThreshold = deliveryConfig?.settings.freeShipThreshold ?? 0;
  const remaining = Math.max(0, freeShipThreshold - total);
  const reachedFreeShip = freeShipThreshold > 0 && total >= freeShipThreshold;

  if (!open) return null;

  return (
    <>
      {!checkoutOpen && (
        <>
          <button
            type="button"
            className="cart-backdrop"
            aria-label="關閉購物車"
            onClick={onClose}
          />
          <aside
            className="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
        <div className="cart-panel-header">
          <h2 id="cart-title">購物車</h2>
          <button type="button" className="cart-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty-state">
            <p>購物車尚無商品</p>
            <p className="muted small">先從人氣果杯或果盤開始選購吧。</p>
            <Link to="/products" className="btn btn-primary btn-block" onClick={onClose}>
              前往選購
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {lines.map((l) => (
                <li key={l.product.id} className="cart-item">
                  <div className="cart-item-main">
                    <strong>{l.product.name}</strong>
                    <span className="muted small">
                      ${l.product.price} × {l.qty}
                    </span>
                  </div>
                  <div className="cart-item-side">
                    <span className="cart-item-sub">${(l.product.price * l.qty).toFixed(0)}</span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => remove(l.product.id)}
                    >
                      移除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-footer">
              <div className="cart-summary-row">
                <span>小計（{count} 件）</span>
                <strong className="cart-total-num">${total.toFixed(0)}</strong>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                onClick={() => {
                  setSubmittedId(null);
                  setSubmitting(false);
                  setCheckoutOpen(true);
                }}
              >
                前往結帳
              </button>
              <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
                繼續購物
              </button>
            </div>
          </>
        )}
          </aside>
        </>
      )}

      {checkoutOpen && (
        <div className="modal-root" role="presentation">
          <button
            type="button"
            className="modal-backdrop"
            aria-label="關閉"
            onClick={() => {
              setCheckoutOpen(false);
              setSubmittedId(null);
              setSubmitting(false);
            }}
          />
          <div className="modal-sheet" role="dialog" aria-labelledby="checkout-title">
            {submittedId ? (
              <>
                <h3 id="checkout-title">訂單意向已提交</h3>
                <p className="modal-text">
                  我們已收到你的資料（訂單編號：<strong>{submittedId}</strong>）。工作日內會由專人確認檔期、配送安排及付款方式。
                </p>
                <p className="muted small" style={{ marginTop: "0.35rem" }}>
                  已嘗試為你開啟 WhatsApp 並帶上訂單編號；若沒有跳出，請按下方按鈕。
                </p>
                <div className="modal-actions" style={{ marginTop: "0.75rem" }}>
                  <a
                    className="btn btn-primary btn-block"
                    href={contactWhatsAppUrl(
                      whatsAppPrefillAfterOrderRequest(submittedId, {
                        customerName: form.name.trim(),
                        totalLabel: `$${total.toFixed(0)}`,
                      })
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    開啟 WhatsApp（已帶訂單編號）
                  </a>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-light btn-block"
                    onClick={() => {
                      setCheckoutOpen(false);
                      setSubmittedId(null);
                      setSubmitting(false);
                      clear();
                      onClose();
                    }}
                  >
                    完成並關閉
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-block"
                    onClick={() => {
                      setCheckoutOpen(false);
                      setSubmittedId(null);
                      setSubmitting(false);
                    }}
                  >
                    返回
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 id="checkout-title">提交訂單意向</h3>
                <p className="modal-text">
                  你提交資料後，我們會即時回覆確認配送檔期與付款安排（工作日內優先處理）。
                </p>

                <div className="checkout-form">
                  {deliveryLoading && (
                    <div className="checkout-summary" style={{ marginBottom: "1rem" }}>
                      <p className="muted small" style={{ marginBottom: 0 }}>
                        正在載入配送檔期…
                      </p>
                    </div>
                  )}
                  {deliveryErr && <p className="error-banner">{deliveryErr}</p>}
                  <div className="checkout-summary">
                    <p className="muted small">你選擇的商品</p>
                    <ul className="checkout-lines">
                      {lines.map((l) => (
                        <li key={l.product.id}>
                          <span>{l.product.name}</span>
                          <span className="muted small">
                            {l.qty} × ${l.product.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="checkout-total">
                      總額（參考）：<strong>${total.toFixed(0)}</strong>
                    </p>
                    {freeShipThreshold > 0 && (
                      <p className="muted small" style={{ marginTop: "0.6rem" }}>
                        {reachedFreeShip ? (
                          <span style={{ color: "var(--brand)", fontWeight: 800 }}>
                            已達免運門檻：配送費用將由優惠覆蓋
                          </span>
                        ) : (
                          <span>
                            距離免運尚差 <strong>${remaining.toFixed(0)}</strong>
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="checkout-grid">
                    <label className="checkout-field">
                      姓名
                      <input
                        className="input"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                        autoComplete="name"
                      />
                    </label>
                    <label className="checkout-field">
                      電話
                      <input
                        className="input"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        required
                        autoComplete="tel"
                      />
                    </label>
                    <label className="checkout-field">
                      電郵（可選）
                      <input
                        className="input"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        type="email"
                        autoComplete="email"
                      />
                    </label>
                    <label className="checkout-field">
                      場景
                      <select
                        className="input"
                        value={form.occasion}
                        onChange={(e) => setForm((f) => ({ ...f, occasion: e.target.value }))}
                      >
                        <option value="辦公午茶">辦公午茶</option>
                        <option value="週末聚會">週末聚會</option>
                        <option value="送禮心意">送禮心意</option>
                        <option value="企業團購">企業團購</option>
                        <option value="其他">其他</option>
                      </select>
                    </label>
                    <label className="checkout-field">
                      配送日期
                      <input
                        className="input"
                        type="date"
                        min={deliveryMinDate}
                        value={form.deliveryDate}
                        onChange={(e) => setForm((f) => ({ ...f, deliveryDate: e.target.value }))}
                        required
                      />
                    </label>
                    <label className="checkout-field">
                      時段
                      <select
                        className="input"
                        value={form.timeSlot}
                        onChange={(e) => setForm((f) => ({ ...f, timeSlot: e.target.value }))}
                      >
                        {(deliveryConfig?.settings.timeSlots || ["12:00-14:00"]).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="checkout-field">
                      配送區域
                      <select
                        className="input"
                        value={form.zoneId}
                        onChange={(e) => setForm((f) => ({ ...f, zoneId: e.target.value }))}
                      >
                        {(deliveryConfig?.zones || []).map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="checkout-field checkout-wide">
                      地址
                      <input
                        className="input"
                        value={form.address}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        required
                        placeholder="例：九龍某道 10 號"
                      />
                    </label>
                    <label className="checkout-field checkout-wide">
                      備註（可選）
                      <textarea
                        className="input"
                        rows={3}
                        value={form.note}
                        onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                        placeholder="例：樓下收貨、需先打電話"
                      />
                    </label>
                  </div>
                </div>

                <ContactChannels variant="compact" />

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    disabled={submitting}
                    onClick={async () => {
                      if (submitting) return;
                      if (!form.name.trim() || !form.phone.trim()) return;
                      if (!form.zoneId.trim()) return;
                      if (!form.timeSlot.trim()) return;
                      if (!form.address.trim()) return;
                      setSubmitting(true);
                      try {
                        const payload = {
                          lines: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
                          delivery: {
                            date: form.deliveryDate,
                            timeSlot: form.timeSlot,
                            zoneId: form.zoneId,
                            address: form.address,
                            note: form.note || undefined,
                          },
                          customer: {
                            name: form.name.trim(),
                            phone: form.phone.trim(),
                            email: form.email.trim() || undefined,
                            occasion: form.occasion || undefined,
                          },
                        };
                        const r = await submitOrderRequest(payload);
                        const wa = whatsAppPrefillAfterOrderRequest(r.id, {
                          customerName: form.name.trim(),
                          totalLabel: `$${total.toFixed(0)}`,
                        });
                        setSubmittedId(r.id);
                        queueMicrotask(() => openWhatsAppWithPrefill(wa));
                      } catch (e) {
                        alert(e instanceof Error ? e.message : "提交失敗");
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    {submitting ? "提交中…" : "提交訂單意向"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-block"
                    onClick={() => {
                      setCheckoutOpen(false);
                      setSubmittedId(null);
                      setSubmitting(false);
                    }}
                  >
                    返回購物車
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
