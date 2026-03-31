import { Link } from "react-router-dom";
import { ContactChannels } from "./ContactChannels";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img className="footer-brand-logo" src="/brand-logo.png" alt="Rya Peach" />
          <p className="footer-tagline">御選時令生果 · 生果杯與禮贈果盤</p>
          <p className="muted small footer-copy">
            以鮮度與信任為核心，服務注重送禮、聚會與日常品味。配送與檔期請參考配送說明。
          </p>
          <div className="footer-contact-block">
            <h3 className="footer-heading footer-heading-inline">聯絡我們</h3>
            <ContactChannels variant="footer" />
          </div>
        </div>
        <div>
          <h3 className="footer-heading">購物指南</h3>
          <ul className="footer-links">
            <li>
              <Link to="/products">全部商品</Link>
            </li>
            <li>
              <Link to="/delivery">配送與檔期</Link>
            </li>
            <li>
              <Link to="/gallery">圖片庫</Link>
            </li>
            <li>
              <Link to="/#faq">常見問題</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="footer-heading">關於品牌</h3>
          <ul className="footer-links">
            <li>
              <Link to="/process">製作理念</Link>
            </li>
            <li>
              <Link to="/contact">聯絡與企業洽詢</Link>
            </li>
            <li>
              <Link to="/admin" className="footer-muted">
                商戶登入
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="small muted">
            © {new Date().getFullYear()} Rya Fruit. 保留所有權利。 ·{" "}
            <Link to="/delivery">運送政策</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
