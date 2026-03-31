import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { CartDrawer } from "./CartDrawer";

const OPEN_CART_EVENT = "rya-fruit:open-cart";

const nav = [
  { to: "/", label: "主頁", end: true },
  { to: "/products", label: "全部商品", end: false },
  { to: "/process", label: "製作理念", end: false },
  { to: "/delivery", label: "配送說明", end: false },
  { to: "/contact", label: "聯絡我們", end: false },
];

export function Header() {
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener(OPEN_CART_EVENT, handler);
    return () => window.removeEventListener(OPEN_CART_EVENT, handler);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <img className="logo-image" src="/brand-logo.png" alt="Rya Peach" />
          </Link>

          <nav
            id="mobile-nav"
            className={`nav-desktop${menuOpen ? " is-open" : ""}`}
            aria-label="主選單"
          >
            {nav.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="cart-toggle"
              onClick={() => setCartOpen(true)}
              aria-expanded={cartOpen}
              aria-label={`購物車，${count} 件商品`}
            >
              <span className="cart-toggle-label">購物車</span>
              <span className="cart-count">{count}</span>
            </button>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "關閉選單" : "開啟選單"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <button
            type="button"
            className="nav-backdrop"
            aria-label="關閉選單"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
