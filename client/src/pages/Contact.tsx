import { useState } from "react";
import { PageSeo } from "../components/PageSeo";
import { ContactChannels } from "../components/ContactChannels";
import {
  contactWhatsAppUrl,
  openWhatsAppWithPrefill,
  whatsAppPrefillAfterCustomerMessage,
} from "../config/site";
import { submitCustomerMessage } from "../api/client";

export function Contact() {
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    occasion: "企業團購",
    message: "",
  });

  return (
    <>
      <PageSeo
        title="聯絡我們"
        description="企業採購、大量訂單、配送與客製需求。可 WhatsApp 或電郵聯絡 Rya Fruit，亦歡迎留言表單；我們將於工作日內回覆。"
        path="/contact"
      />
      <section className="section page-pad">
        <div className="container">
          <div className="contact-box contact-box-v2">
            <p className="section-eyebrow">聯絡與客製需求</p>
            <h1 className="section-title">把你的場次交給我們</h1>
            <p className="muted contact-intro">
              只要填好資料，我們會依預算與人數建議最合適的生果杯／果盤組合與檔期安排。
            </p>

            <ContactChannels variant="page" />

            {submittedId ? (
              <div>
                <p className="muted">已收到你的訊息</p>
                <h2 style={{ margin: "0.5rem 0 0.5rem" }}>
                  訊息編號：{submittedId}
                </h2>
                <p className="muted">工作日內會由專人回覆。感謝你選擇 Rya Fruit。</p>
                <p className="muted small" style={{ marginTop: "0.35rem" }}>
                  已嘗試為你開啟 WhatsApp 並帶上訊息編號；若沒有跳出，請按下方按鈕。
                </p>
                <div className="contact-success-actions">
                  <a
                    className="btn btn-primary btn-lg"
                    href={contactWhatsAppUrl(
                      whatsAppPrefillAfterCustomerMessage(submittedId, {
                        customerName: form.name.trim(),
                        occasion: form.occasion,
                      })
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    開啟 WhatsApp（已帶訊息編號）
                  </a>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-lg"
                  onClick={() => {
                    setSubmittedId(null);
                    setErr(null);
                    setForm({ name: "", phone: "", email: "", occasion: "企業團購", message: "" });
                  }}
                >
                  再提交一次
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setErr(null);
                  if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
                    setErr("請填上姓名、電話及訊息內容。");
                    return;
                  }
                  setSubmitting(true);
                  try {
                    const r = await submitCustomerMessage({
                      name: form.name.trim(),
                      phone: form.phone.trim(),
                      email: form.email.trim() || undefined,
                      occasion: form.occasion || undefined,
                      message: form.message.trim(),
                    });
                    const wa = whatsAppPrefillAfterCustomerMessage(r.id, {
                      customerName: form.name.trim(),
                      occasion: form.occasion,
                    });
                    setSubmittedId(r.id);
                    queueMicrotask(() => openWhatsAppWithPrefill(wa));
                  } catch (er) {
                    setErr(er instanceof Error ? er.message : "提交失敗");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="admin-form contact-form-card"
              >
                <div className="checkout-grid" style={{ marginBottom: "0.5rem" }}>
                  <label className="checkout-field">
                    姓名
                    <input
                      className="input"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="checkout-field">
                    電話
                    <input
                      className="input"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="checkout-field">
                    電郵（可選）
                    <input
                      className="input"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      type="email"
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
                </div>

                <label className="checkout-field checkout-wide">
                  訊息內容
                  <textarea
                    className="input"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    required
                    placeholder="例：要送禮、預計人數 12、希望 4/3 送到九龍塘，預算約 $200–$300/份…"
                  />
                </label>

                {err && <p className="error-banner" style={{ margin: 0 }}>{err}</p>}

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
                  {submitting ? "提交中…" : "提交訊息"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
