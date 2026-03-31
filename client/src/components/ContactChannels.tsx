import {
  CONTACT_EMAIL,
  CONTACT_WHATSAPP_DISPLAY,
  SITE_NAME,
  contactMailtoUrl,
  contactWhatsAppUrl,
} from "../config/site";

type Props = {
  /** page: 顯眼按鈕；footer: 緊湊連結；compact: 一行內文 */
  variant?: "page" | "footer" | "compact";
};

export function ContactChannels({ variant = "page" }: Props) {
  const waHref = contactWhatsAppUrl(`你好，我想查詢${SITE_NAME}的產品／檔期。`);
  const mailHref = contactMailtoUrl(`查詢 ${SITE_NAME}`);

  if (variant === "compact") {
    return (
      <p className="contact-channels contact-channels--compact muted small">
        想快啲跟進？WhatsApp{" "}
        <a href={waHref} target="_blank" rel="noopener noreferrer">
          {CONTACT_WHATSAPP_DISPLAY}
        </a>
        {" · "}
        <a href={mailHref}>{CONTACT_EMAIL}</a>
      </p>
    );
  }

  if (variant === "footer") {
    return (
      <ul className="footer-contact-list">
        <li>
          <a href={waHref} target="_blank" rel="noopener noreferrer">
            WhatsApp {CONTACT_WHATSAPP_DISPLAY}
          </a>
        </li>
        <li>
          <a href={mailHref}>{CONTACT_EMAIL}</a>
        </li>
      </ul>
    );
  }

  return (
    <div className="contact-channels contact-channels--page">
      <p className="muted small contact-channels-lead">想即時傾？直接搵我哋：</p>
      <div className="contact-channels-actions">
        <a className="btn btn-primary" href={waHref} target="_blank" rel="noopener noreferrer">
          WhatsApp {CONTACT_WHATSAPP_DISPLAY}
        </a>
        <a className="btn btn-light" href={mailHref}>
          電郵聯絡
        </a>
      </div>
      <p className="muted small contact-channels-email">{CONTACT_EMAIL}</p>
    </div>
  );
}
