import { useEffect, useState } from "react";
import { PageSeo } from "../components/PageSeo";
import { fetchAuntieImages } from "../api/client";
import type { AuntieImage } from "../api/client";
import { SITE_NAME } from "../config/site";

export function Gallery() {
  const [images, setImages] = useState<AuntieImage[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setErr(null);
    fetchAuntieImages()
      .then(setImages)
      .catch((e) => setErr(e instanceof Error ? e.message : "載入失敗"));
  }, []);

  return (
    <>
      <PageSeo
        title={`圖片庫｜${SITE_NAME}`}
        description="Rya Fruit 圖片庫（已整理自供應素材）。"
        path="/gallery"
        noIndex
      />

      <section className="section page-pad">
        <div className="container">
          <header className="section-head section-head-left">
            <p className="section-eyebrow">圖片庫</p>
            <h1 className="section-title">全部素材，一次睇晒</h1>
            <p className="section-lead">
              呢個頁面用嚟展示已整理嘅品牌素材，方便員工快速查找及對應產品視覺。
            </p>
          </header>

          {err && <p className="error-banner">{err}</p>}

          {!err && images == null && (
            <div className="gallery-skeleton">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="gallery-skel" />
              ))}
            </div>
          )}

          {images && images.length === 0 && <p className="muted">暫時未有可用圖片。</p>}

          {images && images.length > 0 && (
            <div className="gallery-grid" role="list">
              {images.map((img) => (
                <div key={img.file} className="gallery-card" role="listitem">
                  <img src={img.url} alt="" loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

