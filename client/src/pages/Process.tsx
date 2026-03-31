import { PageSeo } from "../components/PageSeo";

export function Process() {
  return (
    <>
      <PageSeo
        title="製作理念"
        description="了解 Rya Fruit 如何以衛生流程、冷鏈思維與時令選果，交付每一份值得信任的新鮮。"
        path="/process"
      />
      <section className="section page-pad process">
        <div className="container">
          <header className="section-head">
            <p className="section-eyebrow">品質核心</p>
            <h1 className="section-title">鮮度，來自每一個細節的堅持</h1>
            <p className="section-lead">
              我們不追求花俏包裝，而將成本與心力放在水果本身 — 讓你吃得到、也看得見差異。
            </p>
          </header>
          <ol className="process-steps process-steps-v2">
            <li>
              <span className="step-num">01</span>
              <h2>時令選果</h2>
              <p>
                依產地與糖度挑選，不硬銷反季；必要時主動替換，確保風味與價值對等。
              </p>
            </li>
            <li>
              <span className="step-num">02</span>
              <h2>衛生製程</h2>
              <p>
                器具與檯面定時清潔，操作全程配戴手套；生熟食與包材分區管理，降低交叉風險。
              </p>
            </li>
            <li>
              <span className="step-num">03</span>
              <h2>冷鏈配送</h2>
              <p>
                製作完成後儘速進入冷藏路線，搭配冰包與保護外箱，縮短溫度變化對口感的影響。
              </p>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
