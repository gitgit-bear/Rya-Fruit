import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function MainLayout() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        跳至主要內容
      </a>
      <Header />
      <main id="main-content" className="main-fill" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
