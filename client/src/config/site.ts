/** 正式上線請於 client/.env 設定 VITE_SITE_URL=https://你的網域（供 canonical、OG 絕對網址） */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "";
export const SITE_NAME = "Rya Fruit";
export const SITE_TAGLINE = "御選時令生果 · 生果杯與禮贈果盤";

/** 客戶聯絡（上線接客用）— 修改號碼／電郵只需改此處 */
export const CONTACT_WHATSAPP_DISPLAY = "4416 5311";
/** wa.me 用：國家／地區碼 + 號碼，無 + 號、無空格（香港為 852） */
export const CONTACT_WHATSAPP_WA = "85244165311";
export const CONTACT_EMAIL = "cwastesting2018@gmail.com";

export function contactWhatsAppUrl(prefill?: string): string {
  const base = `https://wa.me/${CONTACT_WHATSAPP_WA}`;
  const t = prefill?.trim();
  if (!t) return base;
  return `${base}?text=${encodeURIComponent(t)}`;
}

export function contactMailtoUrl(subject?: string): string {
  const q = subject?.trim()
    ? `?subject=${encodeURIComponent(subject.trim())}`
    : "";
  return `mailto:${CONTACT_EMAIL}${q}`;
}

/** 提交「訂單意向」後 WhatsApp 預填（含訂單編號） */
export function whatsAppPrefillAfterOrderRequest(
  orderId: string,
  detail: { customerName: string; totalLabel?: string }
): string {
  const lines = [
    "你好，我剛喺 Rya Fruit 網站提交咗訂單意向。",
    "",
    `訂單編號：${orderId}`,
    `聯絡人：${detail.customerName}`,
  ];
  if (detail.totalLabel) lines.push(`參考總額：${detail.totalLabel}`);
  lines.push("", "請幫我跟進檔期、配送同付款安排，多謝！");
  return lines.join("\n");
}

/** 提交「聯絡訊息」後 WhatsApp 預填（含訊息編號） */
export function whatsAppPrefillAfterCustomerMessage(
  messageId: string,
  detail: { customerName: string; occasion?: string }
): string {
  const lines = [
    "你好，我剛喺 Rya Fruit 網站提交咗客製／聯絡訊息。",
    "",
    `訊息編號：${messageId}`,
    `聯絡人：${detail.customerName}`,
  ];
  if (detail.occasion) lines.push(`場景：${detail.occasion}`);
  lines.push("", "請幫我跟進，多謝！");
  return lines.join("\n");
}

/**
 * 盡量自動開啟 WhatsApp（wa.me）。
 * 部分瀏覽器會阻擋非直接點擊嘅新視窗，成功頁會另設「手動開啟」連結作後備。
 */
export function openWhatsAppWithPrefill(prefill: string): void {
  const url = contactWhatsAppUrl(prefill);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.location.assign(url);
  }
}
