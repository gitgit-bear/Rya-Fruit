import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PageSeo } from "../components/PageSeo";
import {
  createProduct,
  deleteProduct,
  adminLogin,
  adminLogout,
  adminMe,
  fetchProducts,
  fetchAdminOrders,
  fetchAdminMessages,
  fetchAdminDeliveryConfig,
  updateAdminDeliveryConfig,
  updateAdminOrderStatus,
  updateAdminMessage,
  deleteAdminMessage,
  updateProduct,
  uploadProductImage,
} from "../api/client";
import type { AdminMessage, AdminOrder } from "../api/client";
import type { Product } from "../types/product";
import { BADGE_LABELS, type ProductBadgeKey } from "../types/product";
import type { DeliveryConfig } from "../types/delivery";

const BADGE_KEYS = Object.keys(BADGE_LABELS) as ProductBadgeKey[];

type FormState = {
  id: string;
  name: string;
  tag: string;
  highlight: string;
  description: string;
  price: string;
  compareAtPrice: string;
  imageUrl: string;
  badge: string;
};

const emptyForm = (): FormState => ({
  id: "",
  name: "",
  tag: "",
  highlight: "",
  description: "",
  price: "",
  compareAtPrice: "",
  imageUrl: "",
  badge: "",
});

export function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [productQuery, setProductQuery] = useState("");
  const [productBadgeFilter, setProductBadgeFilter] = useState<ProductBadgeKey | "">("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadErr, setImageUploadErr] = useState<string | null>(null);
  const editFormRef = useRef<HTMLFormElement | null>(null);
  const [tab, setTab] = useState<"products" | "orders" | "messages" | "delivery">("products");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [orderStatusDraft, setOrderStatusDraft] = useState<Record<string, string>>({});
  const [orderNoteDraft, setOrderNoteDraft] = useState<Record<string, string>>({});
  const [messageResolvedDraft, setMessageResolvedDraft] = useState<Record<string, boolean>>({});
  const [messageReplyDraft, setMessageReplyDraft] = useState<Record<string, string>>({});

  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryErr, setDeliveryErr] = useState<string | null>(null);
  const [deliveryCfg, setDeliveryCfg] = useState<DeliveryConfig | null>(null);
  const [deliveryDraft, setDeliveryDraft] = useState<DeliveryConfig | null>(null);

  const [zoneEditingId, setZoneEditingId] = useState<string | null>(null);
  const [zoneForm, setZoneForm] = useState<{ name: string; fee: string; note: string }>({
    name: "",
    fee: "0",
    note: "",
  });

  const refresh = useCallback(async () => {
    setErr(null);
    const list = await fetchProducts();
    setProducts(list);
  }, []);

  const refreshOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const list = await fetchAdminOrders();
      setOrders(list);
      const statusMap: Record<string, string> = {};
      const noteMap: Record<string, string> = {};
      for (const o of list) {
        statusMap[o.id] = o.status;
        noteMap[o.id] = "";
      }
      setOrderStatusDraft(statusMap);
      setOrderNoteDraft(noteMap);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const refreshMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const list = await fetchAdminMessages();
      setMessages(list);
      const resolvedMap: Record<string, boolean> = {};
      const replyMap: Record<string, string> = {};
      for (const m of list) {
        resolvedMap[m.id] = m.resolved;
        replyMap[m.id] = m.adminReply ?? "";
      }
      setMessageResolvedDraft(resolvedMap);
      setMessageReplyDraft(replyMap);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const refreshDelivery = useCallback(async () => {
    setDeliveryLoading(true);
    setDeliveryErr(null);
    try {
      const cfg = await fetchAdminDeliveryConfig();
      setDeliveryCfg(cfg);
      setDeliveryDraft(cfg);
      setZoneEditingId(null);
      setZoneForm({ name: "", fee: "0", note: "" });
    } catch (e) {
      setDeliveryErr(e instanceof Error ? e.message : "載入失敗");
    } finally {
      setDeliveryLoading(false);
    }
  }, []);

  useEffect(() => {
    adminMe()
      .then(({ admin }) => {
        setAuthed(admin);
        if (admin) refresh().catch(() => setErr("無法載入產品"));
      })
      .catch(() => setAuthed(false));
  }, [refresh]);

  useEffect(() => {
    if (!authed) return;

    // Dashboard KPI 需要即時資料：避免只在切 tab 後才顯示「總覽」數字。
    if (orders.length === 0 && !ordersLoading) refreshOrders().catch(() => null);
    if (messages.length === 0 && !messagesLoading) refreshMessages().catch(() => null);

    if (!deliveryCfg && !deliveryLoading) {
      setDeliveryLoading(true);
      setDeliveryErr(null);
      fetchAdminDeliveryConfig()
        .then((cfg) => {
          setDeliveryCfg(cfg);
          setDeliveryDraft(cfg);
        })
        .catch(() => setDeliveryErr("無法載入配送設定"))
        .finally(() => setDeliveryLoading(false));
    }
  }, [
    authed,
    orders.length,
    messages.length,
    ordersLoading,
    messagesLoading,
    refreshOrders,
    refreshMessages,
    deliveryCfg,
    deliveryLoading,
  ]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.tag ?? "").toLowerCase().includes(q);
      const matchesBadge = !productBadgeFilter || (p.badge ?? "") === productBadgeFilter;
      return matchesQuery && matchesBadge;
    });
  }, [products, productQuery, productBadgeFilter]);

  const pendingOrdersCount = useMemo(() => {
    const pending = new Set(["pending", "confirmed", "preparing"]);
    return orders.filter((o) => pending.has(o.status)).length;
  }, [orders]);

  const unresolvedMessagesCount = useMemo(() => messages.filter((m) => !m.resolved).length, [messages]);

  const orderPriority = useCallback((status: string) => {
    switch (status) {
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "preparing":
        return 2;
      case "shipped":
        return 3;
      case "completed":
        return 4;
      case "cancelled":
        return 5;
      default:
        return 6;
    }
  }, []);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const pa = orderPriority(a.status);
      const pb = orderPriority(b.status);
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, orderPriority]);

  const unresolvedMessages = useMemo(() => messages.filter((m) => !m.resolved), [messages]);
  const resolvedMessages = useMemo(() => messages.filter((m) => m.resolved), [messages]);

  const deliveryKpi = useMemo(() => {
    if (!deliveryCfg) return null;
    const freeShipThreshold = deliveryCfg.settings.freeShipThreshold;
    return {
      freeShipText: freeShipThreshold > 0 ? `HKD ${freeShipThreshold}` : "免運",
      cutOffTime: deliveryCfg.settings.cutOffTime,
      leadDays: deliveryCfg.settings.leadDays,
      note: deliveryCfg.settings.note,
    };
  }, [deliveryCfg]);

  const orderStatusLabelMap = useMemo(
    () => ({
      pending: "待處理",
      confirmed: "已確認",
      preparing: "備貨中",
      shipped: "已出貨",
      completed: "已完成",
      cancelled: "已取消",
    }),
    []
  );

  const orderStatusToneMap = useMemo(
    () => ({
      pending: "pending",
      confirmed: "info",
      preparing: "warning",
      shipped: "teal",
      completed: "success",
      cancelled: "danger",
    }),
    []
  );

  function OrderStatusBadge({ status }: { status: string }) {
    const label = orderStatusLabelMap[status as keyof typeof orderStatusLabelMap] ?? status;
    const tone = orderStatusToneMap[status as keyof typeof orderStatusToneMap] ?? "neutral";
    return <span className={`admin-status admin-status--${tone}`}>{label}</span>;
  }

  function MessageResolvedBadge({ resolved }: { resolved: boolean }) {
    return resolved ? (
      <span className="admin-status admin-status--success">已處理</span>
    ) : (
      <span className="admin-status admin-status--warning">待回覆</span>
    );
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const pwd = password.trim();
    if (!pwd) return;
    try {
      await adminLogin(pwd);
      setAuthed(true);
      setPassword("");
      setErr(null);
      await refresh();
    } catch (er) {
      setErr(er instanceof Error ? er.message : "登入失敗");
    }
  }

  async function logout() {
    try {
      await adminLogout();
    } catch {
      /* ignore */
    }
    setAuthed(false);
    setProducts([]);
    setEditing(null);
  }

  function productToForm(p: Product): FormState {
    return {
      id: p.id,
      name: p.name,
      tag: p.tag,
      highlight: p.highlight ?? "",
      description: p.description,
      price: String(p.price),
      compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
      imageUrl: p.imageUrl,
      badge: p.badge ?? "",
    };
  }

  function startEdit(p: Product) {
    setEditing(p);
    setForm(productToForm(p));
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm());
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setImageUploadErr(null);
    try {
      const { url } = await uploadProductImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (er) {
      setImageUploadErr(er instanceof Error ? er.message : "上傳失敗");
    } finally {
      setImageUploading(false);
      e.currentTarget.value = "";
    }
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await updateProduct(editing.id, {
        name: form.name,
        tag: form.tag,
        highlight: form.highlight || undefined,
        description: form.description,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice === "" ? undefined : Number(form.compareAtPrice),
        imageUrl: form.imageUrl.trim() || undefined,
        badge: (form.badge || undefined) as Product["badge"],
      });
      cancelEdit();
      await refresh();
    } catch (er) {
      setErr(er instanceof Error ? er.message : "更新失敗");
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    try {
      if (!form.imageUrl.trim()) {
        setErr("請先上傳或貼上商品圖片");
        return;
      }
      await createProduct({
        id: form.id.trim(),
        name: form.name.trim(),
        tag: form.tag.trim(),
        highlight: form.highlight || undefined,
        description: form.description.trim(),
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice === "" ? undefined : Number(form.compareAtPrice),
        imageUrl: form.imageUrl.trim(),
        badge: (form.badge || undefined) as Product["badge"],
      });
      cancelEdit();
      await refresh();
    } catch (er) {
      setErr(er instanceof Error ? er.message : "新增失敗");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("確定刪除此產品？")) return;
    try {
      await deleteProduct(id);
      await refresh();
    } catch (er) {
      setErr(er instanceof Error ? er.message : "刪除失敗");
    }
  }

  const loginBlock = (
    <section className="section page-pad admin-page">
      <PageSeo title="後台登入" description="Rya Fruit 商戶後台登入" path="/admin" noIndex />
      <div className="container narrow">
        <div className="admin-login-card">
          <div className="admin-login-top">
            <p className="muted">
              <Link to="/">← 返回網站</Link>
            </p>
          </div>

          <h1 className="admin-login-title">商戶後台登入</h1>
          <p className="admin-security-note">
            僅供內部營運使用。登入後即可管理商品、訂單、訊息與配送設定。
          </p>

          <form onSubmit={handleLogin} className="admin-login">
            <label>
              管理密碼
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                className="input"
              />
            </label>
            <button type="submit" className="btn btn-primary">
              登入
            </button>
          </form>

          {err ? <p className="error-banner">{err}</p> : <div className="admin-login-hint" />}
        </div>
      </div>
    </section>
  );

  if (!authed) {
    return loginBlock;
  }

  return (
    <section className="section page-pad admin-page">
      <PageSeo title="後台管理" description="Rya Fruit 後台" path="/admin" noIndex />
      <div className="container">
        <header className="admin-dashboard-header">
          <div>
            <div className="admin-dashboard-title-row">
              <h1 className="admin-dashboard-title">後台管理</h1>
              <span className="admin-dashboard-badge">營運總覽</span>
            </div>
            <p className="admin-dashboard-subtitle">
              快速掌握商品、訂單、客服訊息與配送設定，讓每一步管理都更清晰、更高效率。
            </p>
          </div>

          <div className="admin-dashboard-actions">
            <Link to="/" className="btn btn-light">
              返回網站
            </Link>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              登出
            </button>
          </div>
        </header>

        <div className="admin-summary-grid" aria-label="後台總覽 KPI">
          <div className="admin-summary-card">
            <div className="admin-summary-label">商品總數</div>
            <div className="admin-summary-value">{products.length}</div>
            <div className="admin-summary-sub">可即時新增、編輯圖片與標章</div>
          </div>

          <div className="admin-summary-card">
            <div className="admin-summary-label">待處理訂單</div>
            <div className="admin-summary-value">{pendingOrdersCount}</div>
            <div className="admin-summary-sub">
              {pendingOrdersCount > 0 ? "優先處理狀態更新" : "目前沒有待處理工單"}
            </div>
          </div>

          <div className="admin-summary-card">
            <div className="admin-summary-label">未處理訊息</div>
            <div className="admin-summary-value">{unresolvedMessagesCount}</div>
            <div className="admin-summary-sub">Inbox 模式集中查看與回覆</div>
          </div>

          <div className="admin-summary-card">
            <div className="admin-summary-label">配送摘要</div>
            <div className="admin-summary-value">
              {deliveryKpi ? deliveryKpi.freeShipText : deliveryLoading ? "載入中…" : "—"}
            </div>
            <div className="admin-summary-sub">
              {deliveryKpi
                ? `截單 ${deliveryKpi.cutOffTime} · 檔期 +${deliveryKpi.leadDays} 天`
                : "到「配送」頁即可完整查看"}
            </div>
          </div>
        </div>

        <div className="admin-tabs-sticky-wrap">
          <div className="admin-tabs admin-tabs-sticky" role="tablist" aria-label="後台分頁">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "products"}
              className={`admin-tab${tab === "products" ? " is-active" : ""}`}
              onClick={() => setTab("products")}
            >
              商品
              <span className="admin-tab-count">{products.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "orders"}
              className={`admin-tab${tab === "orders" ? " is-active" : ""}`}
              onClick={() => setTab("orders")}
            >
              訂單
              <span className="admin-tab-count">{pendingOrdersCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "messages"}
              className={`admin-tab${tab === "messages" ? " is-active" : ""}`}
              onClick={() => setTab("messages")}
            >
              訊息
              <span className="admin-tab-count">{unresolvedMessagesCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "delivery"}
              className={`admin-tab${tab === "delivery" ? " is-active" : ""}`}
              onClick={() => setTab("delivery")}
            >
              配送
            </button>
          </div>
        </div>

        {err ? <p className="error-banner">{err}</p> : null}

        <div style={{ display: tab === "products" ? "block" : "none" }}>
          <div className="admin-layout admin-layout-products">
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2 className="admin-panel-title">商品列表</h2>
                  <p className="admin-panel-sub muted">搜尋名稱、用標章快速篩選，直接編輯或刪除。</p>
                </div>

                <div className="admin-filter-row">
                  <input
                    className="input"
                    type="text"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="搜尋商品名稱（例如：生果杯 / 果汁）"
                  />
                  <select
                    className="input"
                    value={productBadgeFilter}
                    onChange={(e) => setProductBadgeFilter(e.target.value as ProductBadgeKey | "")}
                    aria-label="標章篩選"
                  >
                    <option value="">全部標章</option>
                    {BADGE_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {BADGE_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-table-wrap">
              <table className="admin-table">
            <thead>
              <tr>
                <th>圖</th>
                <th>名稱</th>
                <th>標章</th>
                <th>價格</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    目前冇符合篩選條件嘅商品
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img className="admin-thumb" src={p.imageUrl} alt="" width={56} height={42} />
                    </td>
                    <td>{p.name}</td>
                    <td>{p.badge ? BADGE_LABELS[p.badge as ProductBadgeKey] ?? p.badge : "—"}</td>
                    <td>${p.price}</td>
                    <td className="admin-actions">
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => startEdit(p)}>
                        編輯
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-small danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
              </div>
            </div>

            <div className="admin-panel admin-panel--editor">
              {editing ? (
                <form className="admin-form" onSubmit={handleSaveEdit} ref={editFormRef}>
              <h2>編輯：{editing.name}</h2>
              <label>
                名稱
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                系列／標籤
                <input
                  className="input"
                  value={form.tag}
                  onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                />
              </label>
              <label>
                短句賣點（highlight）
                <input
                  className="input"
                  value={form.highlight}
                  onChange={(e) => setForm((f) => ({ ...f, highlight: e.target.value }))}
                  placeholder="例：當日現切 · 三至五款時令搭配"
                />
              </label>
              <label>
                描述
                <textarea
                  className="input"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label>
                售價（HKD）
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={1}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </label>
              <label>
                參考價（劃線價，可留空）
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={1}
                  value={form.compareAtPrice}
                  onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
                />
              </label>
              <div className="admin-image-upload">
                <label>
                  圖片上傳（推薦）
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    disabled={imageUploading}
                    onChange={handleImageUpload}
                  />
                </label>
                {imageUploadErr ? <p className="error-banner">{imageUploadErr}</p> : null}
                <div className="admin-image-preview">
                  {form.imageUrl ? (
                    <img className="admin-image-preview-img" src={form.imageUrl} alt="圖片預覽" />
                  ) : (
                    <div className="muted small">尚未設定圖片</div>
                  )}
                </div>
                <label>
                  圖片網址（可手動貼上／上傳後自動填入）
                  <input
                    className="input"
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://... 或上傳後自動產生的 URL"
                  />
                </label>
              </div>
              <label>
                標章（badge）
                <select
                  className="input"
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                >
                  <option value="">無</option>
                  {BADGE_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {BADGE_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  儲存
                </button>
                <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                  取消
                </button>
              </div>
            </form>
              ) : (
                <form className="admin-form" onSubmit={handleCreate} ref={editFormRef}>
                  <h2>新增商品</h2>
                  <label>
                    商品 ID（網址用，英數與連字號）
                    <input
                      className="input"
                      value={form.id}
                      onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                      required
                      pattern="[a-zA-Z0-9-]+"
                    />
                  </label>
              <label>
                名稱
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                系列／標籤
                <input
                  className="input"
                  value={form.tag}
                  onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                />
              </label>
              <label>
                短句賣點
                <input
                  className="input"
                  value={form.highlight}
                  onChange={(e) => setForm((f) => ({ ...f, highlight: e.target.value }))}
                />
              </label>
              <label>
                描述
                <textarea
                  className="input"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label>
                售價（HKD）
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={1}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </label>
              <label>
                參考價（可留空）
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={1}
                  value={form.compareAtPrice}
                  onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
                />
              </label>
              <div className="admin-image-upload">
                <label>
                  商品圖片（上傳推薦）
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    disabled={imageUploading}
                    onChange={handleImageUpload}
                    required={false}
                  />
                </label>
                {imageUploadErr ? <p className="error-banner">{imageUploadErr}</p> : null}
                <div className="admin-image-preview">
                  {form.imageUrl ? (
                    <img className="admin-image-preview-img" src={form.imageUrl} alt="圖片預覽" />
                  ) : (
                    <div className="muted small">請先上傳圖片（或手動貼上 URL）</div>
                  )}
                </div>
                <label>
                  圖片網址（可手動貼上）
                  <input
                    className="input"
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </label>
              </div>
              <label>
                標章
                <select
                  className="input"
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                >
                  <option value="">無</option>
                  {BADGE_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {BADGE_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn btn-primary">
                新增
              </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: tab === "orders" ? "block" : "none" }}>
          {ordersLoading ? (
            <p className="muted">載入中…</p>
          ) : (
            <>
              <div className="admin-tab-section-head">
                <h2 className="admin-panel-title">訂單管理</h2>
                <p className="admin-panel-sub muted">待處理優先、狀態層級清晰，方便快速完成工單。</p>
              </div>
              <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>訂單</th>
                    <th>客戶</th>
                    <th>配送</th>
                    <th>總額</th>
                    <th>狀態</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>{o.id}</strong>
                        <div className="muted small">{new Date(o.createdAt).toLocaleString()}</div>
                      </td>
                      <td>
                        {o.customer.name}
                        <div className="muted small">{o.customer.phone}</div>
                      </td>
                      <td>
                        {o.delivery.date}
                        <div className="muted small">{o.delivery.timeSlot}</div>
                      </td>
                      <td>${o.total.toFixed(0)}</td>
                      <td>
                        <OrderStatusBadge status={o.status} />
                        <select
                          className="input"
                          value={orderStatusDraft[o.id] ?? o.status}
                          onChange={(e) =>
                            setOrderStatusDraft((s) => ({ ...s, [o.id]: e.target.value }))
                          }
                        >
                          <option value="pending">待處理</option>
                          <option value="confirmed">已確認</option>
                          <option value="preparing">備貨中</option>
                          <option value="shipped">已出貨</option>
                          <option value="completed">已完成</option>
                          <option value="cancelled">已取消</option>
                        </select>
                        <input
                          className="input"
                          style={{ marginTop: 0.35 + "rem" }}
                          placeholder="管理備註（可選）"
                          value={orderNoteDraft[o.id] ?? ""}
                          onChange={(e) =>
                            setOrderNoteDraft((s) => ({ ...s, [o.id]: e.target.value }))
                          }
                        />
                      </td>
                      <td className="admin-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-small"
                          onClick={async () => {
                            try {
                              await updateAdminOrderStatus({
                                id: o.id,
                                status: orderStatusDraft[o.id] ?? o.status,
                                adminNote: (orderNoteDraft[o.id] ?? "").trim() || undefined,
                              });
                              await refreshOrders();
                            } catch (e) {
                              alert(e instanceof Error ? e.message : "更新失敗");
                            }
                          }}
                        >
                          儲存
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="muted">
                        目前沒有訂單
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>

        <div style={{ display: tab === "messages" ? "block" : "none" }}>
          {messagesLoading ? (
            <p className="muted">載入中…</p>
          ) : (
            <div className="admin-messages-crm">
              {messages.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-title">目前沒有訊息</div>
                  <div className="admin-empty-sub">當客戶提交查詢表單後，你可以在這裡回覆與標記已處理。</div>
                </div>
              ) : (
                <div className="admin-crm-split">
                  <section className="admin-crm-col">
                    <div className="admin-crm-col-head">
                      <div>
                        <h2 className="admin-panel-title">待處理</h2>
                        <p className="admin-panel-sub muted">優先處理未回覆查詢。</p>
                      </div>
                      <div className="admin-chip-count">{unresolvedMessages.length}</div>
                    </div>

                    {unresolvedMessages.length === 0 ? (
                      <div className="admin-empty small">
                        <div className="admin-empty-title">已全部處理</div>
                        <div className="admin-empty-sub">目前沒有待回覆訊息。</div>
                      </div>
                    ) : (
                      <div className="admin-crm-list" role="list">
                        {unresolvedMessages.map((m) => (
                          <article key={m.id} className="admin-crm-item" role="listitem">
                            <div className="admin-crm-item-head">
                              <div>
                                <div className="admin-crm-id">
                                  {m.id} <span className="muted small">· {new Date(m.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                              <MessageResolvedBadge resolved={m.resolved} />
                            </div>

                            <div className="admin-crm-grid">
                              <div className="admin-workitem-col">
                                <div className="muted small">客戶</div>
                                <div className="strong">{m.name}</div>
                                <div className="muted small">{m.phone}</div>
                              </div>
                              <div className="admin-workitem-col">
                                <div className="muted small">場景</div>
                                <div className="strong">{m.occasion ?? "—"}</div>
                              </div>
                            </div>

                            <div className="admin-crm-content">
                              {m.content.length > 220 ? m.content.slice(0, 217) + "…" : m.content}
                            </div>

                            <div className="admin-crm-actions">
                              <label className="admin-check">
                                <input
                                  type="checkbox"
                                  checked={messageResolvedDraft[m.id] ?? m.resolved}
                                  onChange={(e) => {
                                    const next = e.target.checked;
                                    setMessageResolvedDraft((s) => ({ ...s, [m.id]: next }));
                                  }}
                                />
                                已處理
                              </label>

                              <label className="admin-mini-label" style={{ width: "100%" }}>
                                回覆內容（可選）
                                <textarea
                                  className="input"
                                  rows={3}
                                  value={messageReplyDraft[m.id] ?? ""}
                                  onChange={(e) =>
                                    setMessageReplyDraft((s) => ({ ...s, [m.id]: e.target.value }))
                                  }
                                  placeholder="例如：已安排配送、需要補充地址、推薦合適水果杯…"
                                />
                              </label>

                              <div className="admin-crm-buttons">
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={async () => {
                                    try {
                                      await updateAdminMessage({
                                        id: m.id,
                                        resolved: messageResolvedDraft[m.id] ?? m.resolved,
                                        adminReply: (messageReplyDraft[m.id] ?? "").trim() || undefined,
                                      });
                                      await refreshMessages();
                                    } catch (e) {
                                      alert(e instanceof Error ? e.message : "更新失敗");
                                    }
                                  }}
                                >
                                  儲存
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost danger"
                                  onClick={async () => {
                                    if (!confirm("確定刪除此訊息？")) return;
                                    try {
                                      await deleteAdminMessage(m.id);
                                      await refreshMessages();
                                    } catch (e) {
                                      alert(e instanceof Error ? e.message : "刪除失敗");
                                    }
                                  }}
                                >
                                  刪除
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="admin-crm-col">
                    <div className="admin-crm-col-head">
                      <div>
                        <h2 className="admin-panel-title">已處理</h2>
                        <p className="admin-panel-sub muted">已回覆或完成處理的查詢。</p>
                      </div>
                      <div className="admin-chip-count">{resolvedMessages.length}</div>
                    </div>

                    {resolvedMessages.length === 0 ? (
                      <div className="admin-empty small">
                        <div className="admin-empty-title">尚未有已處理訊息</div>
                        <div className="admin-empty-sub">當你將訊息標記已處理後，這裡會更新。</div>
                      </div>
                    ) : (
                      <div className="admin-crm-list" role="list">
                        {resolvedMessages.map((m) => (
                          <article key={m.id} className="admin-crm-item" role="listitem">
                            <div className="admin-crm-item-head">
                              <div>
                                <div className="admin-crm-id">
                                  {m.id} <span className="muted small">· {new Date(m.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                              <MessageResolvedBadge resolved={m.resolved} />
                            </div>

                            <div className="admin-crm-grid">
                              <div className="admin-workitem-col">
                                <div className="muted small">客戶</div>
                                <div className="strong">{m.name}</div>
                                <div className="muted small">{m.phone}</div>
                              </div>
                              <div className="admin-workitem-col">
                                <div className="muted small">場景</div>
                                <div className="strong">{m.occasion ?? "—"}</div>
                              </div>
                            </div>

                            <div className="admin-crm-content">
                              {m.content.length > 220 ? m.content.slice(0, 217) + "…" : m.content}
                            </div>

                            <div className="admin-crm-actions">
                              <label className="admin-check">
                                <input
                                  type="checkbox"
                                  checked={messageResolvedDraft[m.id] ?? m.resolved}
                                  onChange={(e) => {
                                    const next = e.target.checked;
                                    setMessageResolvedDraft((s) => ({ ...s, [m.id]: next }));
                                  }}
                                />
                                已處理
                              </label>

                              <label className="admin-mini-label" style={{ width: "100%" }}>
                                回覆內容（可選）
                                <textarea
                                  className="input"
                                  rows={3}
                                  value={messageReplyDraft[m.id] ?? ""}
                                  onChange={(e) =>
                                    setMessageReplyDraft((s) => ({ ...s, [m.id]: e.target.value }))
                                  }
                                  placeholder="補充回覆內容…"
                                />
                              </label>

                              <div className="admin-crm-buttons">
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={async () => {
                                    try {
                                      await updateAdminMessage({
                                        id: m.id,
                                        resolved: messageResolvedDraft[m.id] ?? m.resolved,
                                        adminReply: (messageReplyDraft[m.id] ?? "").trim() || undefined,
                                      });
                                      await refreshMessages();
                                    } catch (e) {
                                      alert(e instanceof Error ? e.message : "更新失敗");
                                    }
                                  }}
                                >
                                  儲存
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost danger"
                                  onClick={async () => {
                                    if (!confirm("確定刪除此訊息？")) return;
                                    try {
                                      await deleteAdminMessage(m.id);
                                      await refreshMessages();
                                    } catch (e) {
                                      alert(e instanceof Error ? e.message : "刪除失敗");
                                    }
                                  }}
                                >
                                  刪除
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: tab === "delivery" ? "block" : "none" }}>
          {deliveryLoading && <p className="muted">載入中…</p>}
          {deliveryErr && <p className="error-banner">{deliveryErr}</p>}
          {!deliveryLoading && deliveryDraft && (
            <div className="admin-delivery-wrap">
              <div className="admin-delivery-layout">
                <form
                  className="admin-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!deliveryDraft) return;
                    const next = deliveryDraft;
                    updateAdminDeliveryConfig(next)
                      .then(() => refreshDelivery())
                      .catch((er) => setDeliveryErr(er instanceof Error ? er.message : "更新失敗"));
                  }}
                >
                  <h2>配送設定</h2>
                  <label>
                    免運門檻（HKD）
                    <input
                      className="input"
                      type="number"
                      min={0}
                      step={1}
                      value={deliveryDraft.settings.freeShipThreshold}
                      onChange={(e) =>
                        setDeliveryDraft((d) =>
                          d
                            ? {
                                ...d,
                                settings: { ...d.settings, freeShipThreshold: Number(e.target.value) },
                              }
                            : d
                        )
                      }
                    />
                  </label>
                  <label>
                    截單時間（HH:mm）
                    <input
                      className="input"
                      type="time"
                      value={deliveryDraft.settings.cutOffTime}
                      onChange={(e) =>
                        setDeliveryDraft((d) =>
                          d ? { ...d, settings: { ...d.settings, cutOffTime: e.target.value } } : d
                        )
                      }
                    />
                  </label>
                  <label>
                    檔期延後天數（leadDays）
                    <input
                      className="input"
                      type="number"
                      min={0}
                      step={1}
                      value={deliveryDraft.settings.leadDays}
                      onChange={(e) =>
                        setDeliveryDraft((d) =>
                          d ? { ...d, settings: { ...d.settings, leadDays: Number(e.target.value) } } : d
                        )
                      }
                    />
                  </label>
                  <label>
                    配送時段（每行一個；例：12:00-14:00）
                    <textarea
                      className="input"
                      rows={5}
                      value={deliveryDraft.settings.timeSlots.join("\n")}
                      onChange={(e) => {
                        const text = e.target.value;
                        const slots = text
                          .split(/[\n,]+/g)
                          .map((x) => x.trim())
                          .filter(Boolean);
                        setDeliveryDraft((d) =>
                          d ? { ...d, settings: { ...d.settings, timeSlots: slots } } : d
                        );
                      }}
                    />
                  </label>
                  <label>
                    包裝/配送備註（會顯示於配送頁與結帳）
                    <textarea
                      className="input"
                      rows={4}
                      value={deliveryDraft.settings.note}
                      onChange={(e) =>
                        setDeliveryDraft((d) =>
                          d ? { ...d, settings: { ...d.settings, note: e.target.value } } : d
                        )
                      }
                    />
                  </label>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      儲存設定
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setDeliveryDraft(deliveryCfg);
                        setDeliveryErr(null);
                        setZoneEditingId(null);
                        setZoneForm({ name: "", fee: "0", note: "" });
                      }}
                    >
                      取消編輯
                    </button>
                  </div>
                </form>

                <div className="admin-delivery-zones">
                  <h2 style={{ marginTop: 0 }}>配送區域</h2>
                    <div className="admin-zone-list" role="list" aria-label="配送區域列表">
                      {deliveryDraft.zones.length === 0 ? (
                        <div className="admin-empty small">
                          <div className="admin-empty-title">尚未建立配送區域</div>
                          <div className="admin-empty-sub">新增區域後即可在配送頁自動計算運費。</div>
                        </div>
                      ) : (
                        deliveryDraft.zones.map((z) => (
                          <div
                            key={z.id}
                            className={`admin-zone-item${zoneEditingId === z.id ? " is-active" : ""}`}
                            role="listitem"
                          >
                            <div className="admin-zone-main">
                              <div className="strong">{z.name}</div>
                              {z.note ? <div className="muted small">{z.note}</div> : null}
                            </div>

                            <div className="admin-zone-right">
                              <div className="admin-zone-fee">
                                {z.fee > 0 ? `$${z.fee}` : "一般地區免運"}
                              </div>
                              <div className="admin-zone-actions">
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-small"
                                  onClick={() => {
                                    setZoneEditingId(z.id);
                                    setZoneForm({ name: z.name, fee: String(z.fee), note: z.note ?? "" });
                                  }}
                                >
                                  編輯
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-small danger"
                                  style={{ marginLeft: 0.5 + "rem" }}
                                  onClick={async () => {
                                    if (!confirm("確定刪除此配送區域？")) return;
                                    const nextZones = deliveryDraft.zones.filter((x) => x.id !== z.id);
                                    const next: DeliveryConfig = { ...deliveryDraft, zones: nextZones };
                                    await updateAdminDeliveryConfig(next);
                                    await refreshDelivery();
                                  }}
                                >
                                  刪除
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                  <form
                    className="admin-form"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const name = zoneForm.name.trim();
                      const fee = Number(zoneForm.fee);
                      const note = zoneForm.note.trim();
                      if (!name || !Number.isFinite(fee)) {
                        setDeliveryErr("請填上區域名稱與有效配送費");
                        return;
                      }
                      if (!deliveryDraft) return;
                      const id =
                        zoneEditingId ||
                        `zone-${name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;

                      const nextZone = { id, name, fee: fee > 0 ? fee : 0, note };
                      const nextZones = zoneEditingId
                        ? deliveryDraft.zones.map((z) => (z.id === zoneEditingId ? nextZone : z))
                        : [nextZone, ...deliveryDraft.zones];
                      const next: DeliveryConfig = { ...deliveryDraft, zones: nextZones };
                      setDeliveryErr(null);
                      await updateAdminDeliveryConfig(next);
                      setZoneEditingId(null);
                      setZoneForm({ name: "", fee: "0", note: "" });
                      await refreshDelivery();
                    }}
                  >
                    <h2 style={{ marginTop: 0 }}>{zoneEditingId ? "編輯配送區域" : "新增配送區域"}</h2>
                    <label>
                      區域名稱
                      <input
                        className="input"
                        value={zoneForm.name}
                        onChange={(e) => setZoneForm((z) => ({ ...z, name: e.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      配送費（HKD；一般地區可填 0）
                      <input
                        className="input"
                        type="number"
                        min={0}
                        step={1}
                        value={zoneForm.fee}
                        onChange={(e) => setZoneForm((z) => ({ ...z, fee: e.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      備註（可選）
                      <textarea
                        className="input"
                        rows={3}
                        value={zoneForm.note}
                        onChange={(e) => setZoneForm((z) => ({ ...z, note: e.target.value }))}
                      />
                    </label>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {zoneEditingId ? "保存區域" : "新增區域"}
                      </button>
                      {zoneEditingId ? (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => {
                            setZoneEditingId(null);
                            setZoneForm({ name: "", fee: "0", note: "" });
                          }}
                        >
                          取消
                        </button>
                      ) : null}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
