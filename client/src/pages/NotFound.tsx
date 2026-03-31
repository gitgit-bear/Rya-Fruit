import { Link } from "react-router-dom";
import { PageSeo } from "../components/PageSeo";

export function NotFound() {
  return (
    <>
      <PageSeo
        title="找不到頁面"
        description="您瀏覽的頁面不存在。"
        path="/404"
        noIndex
      />
      <section className="section page-pad">
        <div className="container narrow center">
          <h1>找不到頁面</h1>
          <p className="muted">連結可能已更新，請從主頁重新瀏覽。</p>
          <Link to="/" className="btn btn-primary btn-lg">
            返回主頁
          </Link>
        </div>
      </section>
    </>
  );
}
