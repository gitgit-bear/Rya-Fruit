import type { Product } from "../types/product";
import type { DeliveryConfig } from "../types/delivery";

const base = import.meta.env.VITE_API_BASE ?? "";

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

function handleError(resp: Response) {
  return resp
    .json()
    .catch(() => ({}))
    .then((data) => {
      const msg = (data as { error?: string }).error || "請求失敗";
      throw new Error(msg);
    });
}

export async function fetchProducts(): Promise<Product[]> {
  const r = await fetch(`${base}/api/products`, { credentials: "include" });
  if (!r.ok) throw new Error("無法載入產品");
  return r.json();
}

export type AuntieImage = { file: string; url: string };

export async function fetchAuntieImages(): Promise<AuntieImage[]> {
  const r = await fetch(`${base}/api/auntie-images`, { credentials: "include" });
  if (!r.ok) throw new Error("無法載入圖片庫");
  const data = await r.json().catch(() => ({}));
  return (data as { images: AuntieImage[] }).images;
}

export async function fetchProduct(id: string): Promise<Product> {
  const r = await fetch(`${base}/api/products/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error("無法載入產品");
  return r.json();
}

// Admin (session cookie based)
export async function adminMe(): Promise<{ admin: boolean }> {
  const r = await fetch(`${base}/api/admin/me`, { credentials: "include" });
  if (!r.ok) throw new Error("無法取得管理狀態");
  return r.json();
}

export async function adminLogin(password: string): Promise<void> {
  const r = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify({ password }),
  });
  if (!r.ok) return handleError(r);
}

export async function adminLogout(): Promise<void> {
  const r = await fetch(`${base}/api/admin/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!r.ok) return handleError(r);
}

export async function createProduct(body: Product): Promise<Product> {
  const r = await fetch(`${base}/api/products`, {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || "新增失敗");
  return data as Product;
}

export async function updateProduct(
  id: string,
  body: Partial<Omit<Product, "id">>
): Promise<Product> {
  const r = await fetch(`${base}/api/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || "更新失敗");
  return data as Product;
}

export async function uploadProductImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("image", file);

  const r = await fetch(`${base}/api/admin/uploads/product-image`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || "上傳失敗");
  return data as { url: string };
}

export async function deleteProduct(id: string): Promise<void> {
  const r = await fetch(`${base}/api/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!r.ok) return handleError(r);
}

// -------- Public: Orders & Messages --------
export type OrderRequestLine = { productId: string; qty: number };
export type OrderRequestDelivery = {
  date: string;
  timeSlot: string;
  zoneId: string;
  address: string;
  note?: string;
};
export type OrderRequestCustomer = {
  name: string;
  phone: string;
  email?: string;
  occasion?: string;
};

export async function submitOrderRequest(payload: {
  lines: OrderRequestLine[];
  delivery: OrderRequestDelivery;
  customer: OrderRequestCustomer;
}): Promise<{ ok: true; id: string }> {
  const r = await fetch(`${base}/api/orders/request`, {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || "提交失敗");
  return data as { ok: true; id: string };
}

// -------- Public: Delivery rules --------
export async function fetchDeliveryConfig(): Promise<DeliveryConfig> {
  const r = await fetch(`${base}/api/delivery`, { credentials: "include" });
  if (!r.ok) throw new Error("無法載入配送設定");
  return r.json();
}

// -------- Admin: Delivery rules --------
export async function fetchAdminDeliveryConfig(): Promise<DeliveryConfig> {
  const r = await fetch(`${base}/api/admin/delivery`, { credentials: "include" });
  if (!r.ok) throw new Error("無法讀取配送設定");
  return r.json();
}

export async function updateAdminDeliveryConfig(payload: DeliveryConfig): Promise<void> {
  const r = await fetch(`${base}/api/admin/delivery`, {
    method: "PUT",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    return handleError(r);
  }
}

export async function submitCustomerMessage(payload: {
  name: string;
  phone: string;
  email?: string;
  occasion?: string;
  message: string;
}): Promise<{ ok: true; id: string }> {
  const r = await fetch(`${base}/api/messages/submit`, {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || "提交失敗");
  return data as { ok: true; id: string };
}

// -------- Admin: Orders & Messages --------
export type AdminOrder = {
  id: string;
  createdAt: string;
  status: string;
  customer: { name: string; phone: string; email?: string; occasion?: string };
  delivery: {
    date: string;
    timeSlot: string;
    zoneId?: string;
    zoneName?: string;
    address: string;
    note?: string;
  };
  lines: { productId: string; qty: number; productName: string; unitPrice: number }[];
  total: number;
  adminNotes?: { createdAt: string; text: string }[];
  shippingFee?: number;
};

export type AdminMessage = {
  id: string;
  createdAt: string;
  resolved: boolean;
  name: string;
  phone: string;
  email?: string;
  occasion?: string;
  content: string;
  adminReply?: string;
};

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const r = await fetch(`${base}/api/admin/orders`, { credentials: "include" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || "讀取失敗");
  return (data as { orders: AdminOrder[] }).orders;
}

export async function updateAdminOrderStatus(payload: {
  id: string;
  status: string;
  adminNote?: string;
}): Promise<void> {
  const r = await fetch(`${base}/api/admin/orders/${encodeURIComponent(payload.id)}`, {
    method: "PUT",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify({
      status: payload.status,
      adminNote: payload.adminNote,
    }),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "更新失敗");
  }
}

export async function fetchAdminMessages(): Promise<AdminMessage[]> {
  const r = await fetch(`${base}/api/admin/messages`, { credentials: "include" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || "讀取失敗");
  return (data as { messages: AdminMessage[] }).messages;
}

export async function updateAdminMessage(payload: {
  id: string;
  resolved: boolean;
  adminReply?: string;
}): Promise<void> {
  const r = await fetch(`${base}/api/admin/messages/${encodeURIComponent(payload.id)}`, {
    method: "PUT",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify({
      resolved: payload.resolved,
      adminReply: payload.adminReply,
    }),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "更新失敗");
  }
}

export async function deleteAdminMessage(id: string): Promise<void> {
  const r = await fetch(`${base}/api/admin/messages/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "刪除失敗");
  }
}
