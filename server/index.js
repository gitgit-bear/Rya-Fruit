import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import multer from "multer";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "data", "products.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const AUNTIE_PHOTOS_DIR = path.join(__dirname, "..", "fruity_auntie_pages_1_to_4_all_jpg");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "dev-admin-secret";
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === "production";
const clientDist = path.join(__dirname, "..", "client", "dist");

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret-change-me";
const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "rya_admin_session";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Image uploads (admin only)
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(() => null);
app.use("/uploads", express.static(UPLOAD_DIR));

// Serve pre-downloaded images for admins/products.
// In dev, Vite proxy must forward `/auntie-photos` to this server.
app.use("/auntie-photos", express.static(AUNTIE_PHOTOS_DIR));

// Public: list pre-downloaded images for gallery usage.
app.get("/api/auntie-images", async (_req, res) => {
  try {
    const files = await fs.readdir(AUNTIE_PHOTOS_DIR);
    const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
    const images = files
      .filter((f) => allowed.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((f) => ({
        file: f,
        url: `/auntie-photos/${encodeURIComponent(f)}`,
      }));
    res.json({ images });
  } catch {
    res.json({ images: [] });
  }
});

// Admin auth: HttpOnly session cookie (production should set SESSION_SECRET).
app.use(
  session({
    name: ADMIN_COOKIE_NAME,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

function authAdmin(req, res, next) {
  // Session-based auth (preferred)
  if (req.session && req.session.admin === true) return next();

  // Backward compatibility: allow legacy Bearer token header.
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (token && token === ADMIN_TOKEN) {
    if (req.session) req.session.admin = true;
    return next();
  }

  return res.status(401).json({ error: "需要管理員權限" });
}

function normalizeProductInput(body, existing = {}) {
  const out = { ...existing };
  if (body.name != null) out.name = String(body.name).trim();
  if (body.tag != null) out.tag = String(body.tag).trim();
  if ("highlight" in body) {
    const h = body.highlight;
    out.highlight = h == null || h === "" ? undefined : String(h).trim();
  }
  if (body.description != null) out.description = String(body.description).trim();
  if (body.price != null) out.price = Number(body.price);
  if ("compareAtPrice" in body) {
    const v = body.compareAtPrice;
    out.compareAtPrice = v === "" || v == null ? undefined : Number(v);
  }
  if (body.imageUrl != null) out.imageUrl = String(body.imageUrl).trim();
  if ("badge" in body) {
    const b = body.badge;
    out.badge = b === "" || b == null ? undefined : String(b).trim();
  }
  return out;
}

async function readProducts() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

async function writeProducts(products) {
  await fs.writeFile(DATA_PATH, JSON.stringify(products, null, 2), "utf8");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Admin session endpoints
app.post("/api/admin/login", async (req, res) => {
  try {
    const body = req.body || {};
    const candidate = body.password ?? body.token;
    if (!candidate) return res.status(400).json({ error: "缺少 password" });
    if (candidate !== ADMIN_TOKEN) {
      return res.status(401).json({ error: "管理密碼不正確" });
    }
    if (req.session) req.session.admin = true;
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "登入失敗" });
  }
});

app.post("/api/admin/logout", (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/admin/me", (req, res) => {
  res.json({ admin: !!(req.session && req.session.admin === true) });
});

app.get("/api/admin/ping", authAdmin, (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/products", async (_req, res) => {
  try {
    const products = await readProducts();
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "無法讀取產品資料" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const products = await readProducts();
    const p = products.find((x) => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: "找不到產品" });
    res.json(p);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

app.post("/api/products", authAdmin, async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id || !req.body?.name || typeof req.body?.price !== "number") {
      return res.status(400).json({ error: "缺少 id、name 或 price" });
    }
    const products = await readProducts();
    const sid = String(id).trim();
    if (products.some((x) => x.id === sid)) {
      return res.status(409).json({ error: "此 id 已存在" });
    }
    const item = normalizeProductInput(req.body, { id: sid });
    products.push(item);
    await writeProducts(products);
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "無法新增產品" });
  }
});

app.put("/api/products/:id", authAdmin, async (req, res) => {
  try {
    const products = await readProducts();
    const idx = products.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "找不到產品" });
    const cur = products[idx];
    products[idx] = normalizeProductInput(req.body, cur);
    await writeProducts(products);
    res.json(products[idx]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "無法更新產品" });
  }
});

// Admin image upload: employees can upload a product image and get back a URL.
const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
      const safeExt = allowed.has(ext) ? ext : ".jpg";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("只允許上傳圖片檔"));
  },
});

app.post(
  "/api/admin/uploads/product-image",
  authAdmin,
  imageUpload.single("image"),
  async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "缺少 image 檔案" });

    const protoHeader = req.headers["x-forwarded-proto"];
    const proto = typeof protoHeader === "string" && protoHeader ? protoHeader : req.protocol;
    const host = req.get("host");
    const publicBase = process.env.PUBLIC_UPLOAD_BASE || `${proto}://${host}`;

    const url = `${publicBase}/uploads/${file.filename}`;
    res.json({ url });
  }
);

app.delete("/api/products/:id", authAdmin, async (req, res) => {
  try {
    const products = await readProducts();
    const next = products.filter((x) => x.id !== req.params.id);
    if (next.length === products.length) {
      return res.status(404).json({ error: "找不到產品" });
    }
    await writeProducts(next);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "無法刪除產品" });
  }
});

// -------- Orders & Messages (JSON storage) --------
const ORDERS_PATH = path.join(__dirname, "data", "orders.json");
const MESSAGES_PATH = path.join(__dirname, "data", "messages.json");
const DELIVERY_PATH = path.join(__dirname, "data", "delivery.json");

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJsonFile(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

function uid() {
  return (
    Math.random().toString(36).slice(2, 10) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

async function readDelivery() {
  try {
    return await readJsonFile(DELIVERY_PATH);
  } catch {
    return {
      settings: {
        freeShipThreshold: 500,
        cutOffTime: "18:00",
        leadDays: 1,
        timeSlots: ["12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"],
        note:
          "果杯以紙箱保護，並於配送期間附上冰包保冷；為確保風味，建議收貨後盡快冷藏並於 24 小時內享用。",
      },
      zones: [],
    };
  }
}

async function writeDelivery(delivery) {
  await writeJsonFile(DELIVERY_PATH, delivery);
}

function normalizeDeliveryInput(input) {
  const settingsIn = input?.settings || {};
  const zonesIn = Array.isArray(input?.zones) ? input.zones : [];

  const settings = {
    freeShipThreshold: Number(settingsIn.freeShipThreshold ?? 0),
    cutOffTime: String(settingsIn.cutOffTime ?? "18:00"),
    leadDays: Math.max(0, Number(settingsIn.leadDays ?? 1)),
    note: settingsIn.note ? String(settingsIn.note) : "",
    timeSlots: Array.isArray(settingsIn.timeSlots)
      ? settingsIn.timeSlots.map((t) => String(t).trim()).filter(Boolean)
      : ["12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"],
  };

  const zones = zonesIn
    .map((z) => {
      const id = z?.id ? String(z.id).trim() : "";
      const name = z?.name ? String(z.name).trim() : "";
      const fee = Number(z?.fee ?? 0);
      if (!id || !name) return null;
      return {
        id,
        name,
        fee: Number.isFinite(fee) ? fee : 0,
        note: z?.note ? String(z.note).trim() : "",
      };
    })
    .filter(Boolean);

  return { settings, zones };
}

// Public delivery rules
app.get("/api/delivery", async (_req, res) => {
  try {
    const delivery = await readDelivery();
    res.json(delivery);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "無法載入配送設定" });
  }
});

// Admin delivery rules
app.get("/api/admin/delivery", authAdmin, async (_req, res) => {
  try {
    const delivery = await readDelivery();
    res.json(delivery);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "無法讀取配送設定" });
  }
});

app.put("/api/admin/delivery", authAdmin, async (req, res) => {
  try {
    const normalized = normalizeDeliveryInput(req.body || {});
    await writeDelivery(normalized);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "更新失敗" });
  }
});

app.post("/api/orders/request", async (req, res) => {
  try {
    const body = req.body || {};
    const lines = Array.isArray(body.lines) ? body.lines : [];
    const delivery = body.delivery || {};
    const customer = body.customer || {};

    if (lines.length === 0) return res.status(400).json({ error: "缺少商品清單" });
    if (!customer.name || !customer.phone)
      return res.status(400).json({ error: "缺少聯絡人姓名或電話" });

    const deliveryDate = delivery.date;
    const timeSlot = delivery.timeSlot;
    const address = delivery.address;
    const zoneId = delivery.zoneId;
    if (!deliveryDate || !timeSlot || !address || !zoneId) {
      return res.status(400).json({ error: "缺少配送日期/時段/區域/地址" });
    }

    const catalog = await readProducts();
    const deliveryConfig = await readDelivery();
    const zone = Array.isArray(deliveryConfig.zones)
      ? deliveryConfig.zones.find((z) => z.id === zoneId)
      : undefined;
    if (!zone) return res.status(400).json({ error: "找不到配送區域" });
    if (
      Array.isArray(deliveryConfig.settings?.timeSlots) &&
      !deliveryConfig.settings.timeSlots.includes(timeSlot)
    ) {
      return res.status(400).json({ error: "無效的配送時段" });
    }

    const normalizedLines = lines
      .map((l) => {
        const product = catalog.find((p) => p.id === l.productId);
        if (!product) return null;
        const qty = Number(l.qty);
        if (!Number.isFinite(qty) || qty <= 0) return null;
        return {
          productId: product.id,
          qty,
          productName: product.name,
          unitPrice: product.price,
        };
      })
      .filter(Boolean);

    if (normalizedLines.length === 0) {
      return res.status(400).json({ error: "商品資料有誤或已下架" });
    }

    const total = normalizedLines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    const freeThreshold = Number(deliveryConfig.settings?.freeShipThreshold ?? 0);
    const shippingFee = total >= freeThreshold ? 0 : Number(zone.fee ?? 0);
    const order = {
      id: "ORD-" + uid(),
      createdAt: new Date().toISOString(),
      status: "pending",
      customer: {
        name: String(customer.name).trim(),
        phone: String(customer.phone).trim(),
        email: customer.email ? String(customer.email).trim() : undefined,
        occasion: customer.occasion ? String(customer.occasion).trim() : undefined,
      },
      delivery: {
        date: String(deliveryDate),
        timeSlot: String(timeSlot),
        zoneId: String(zoneId),
        zoneName: String(zone.name ?? ""),
        address: String(address).trim(),
        note: delivery.note ? String(delivery.note).trim() : undefined,
      },
      lines: normalizedLines,
      total,
      shippingFee,
      adminNotes: [],
    };

    const orders = await readJsonFile(ORDERS_PATH).catch(() => []);
    orders.unshift(order);
    await writeJsonFile(ORDERS_PATH, orders);

    res.status(201).json({ ok: true, id: order.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "提交失敗" });
  }
});

app.post("/api/messages/submit", async (req, res) => {
  try {
    const body = req.body || {};
    const name = body.name;
    const phone = body.phone;
    const message = body.message;
    if (!name || !phone || !message) {
      return res.status(400).json({ error: "缺少必填欄位" });
    }
    const msg = {
      id: "MSG-" + uid(),
      createdAt: new Date().toISOString(),
      resolved: false,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: body.email ? String(body.email).trim() : undefined,
      occasion: body.occasion ? String(body.occasion).trim() : undefined,
      content: String(message).trim(),
      adminReply: undefined,
    };

    const messages = await readJsonFile(MESSAGES_PATH).catch(() => []);
    messages.unshift(msg);
    await writeJsonFile(MESSAGES_PATH, messages);

    res.status(201).json({ ok: true, id: msg.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "提交失敗" });
  }
});

app.get("/api/admin/orders", authAdmin, async (_req, res) => {
  try {
    const orders = await readJsonFile(ORDERS_PATH).catch(() => []);
    res.json({ orders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "無法讀取訂單" });
  }
});

app.put("/api/admin/orders/:id", authAdmin, async (req, res) => {
  try {
    const orders = await readJsonFile(ORDERS_PATH).catch(() => []);
    const idx = orders.findIndex((o) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "找不到訂單" });
    const { status, adminNote } = req.body || {};
    if (status) orders[idx].status = String(status);
    if (adminNote && String(adminNote).trim()) {
      orders[idx].adminNotes = Array.isArray(orders[idx].adminNotes)
        ? orders[idx].adminNotes
        : [];
      orders[idx].adminNotes.unshift({
        createdAt: new Date().toISOString(),
        text: String(adminNote).trim(),
      });
    }
    await writeJsonFile(ORDERS_PATH, orders);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "更新失敗" });
  }
});

app.get("/api/admin/messages", authAdmin, async (_req, res) => {
  try {
    const messages = await readJsonFile(MESSAGES_PATH).catch(() => []);
    res.json({ messages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "無法讀取訊息" });
  }
});

app.put("/api/admin/messages/:id", authAdmin, async (req, res) => {
  try {
    const messages = await readJsonFile(MESSAGES_PATH).catch(() => []);
    const idx = messages.findIndex((m) => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "找不到訊息" });
    const { resolved, adminReply } = req.body || {};
    if (typeof resolved === "boolean") messages[idx].resolved = resolved;
    if (adminReply && String(adminReply).trim()) messages[idx].adminReply = String(adminReply).trim();
    await writeJsonFile(MESSAGES_PATH, messages);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "更新失敗" });
  }
});

app.delete("/api/admin/messages/:id", authAdmin, async (req, res) => {
  try {
    const messages = await readJsonFile(MESSAGES_PATH).catch(() => []);
    const next = messages.filter((m) => m.id !== req.params.id);
    if (next.length === messages.length) return res.status(404).json({ error: "找不到訊息" });
    await writeJsonFile(MESSAGES_PATH, next);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "刪除失敗" });
  }
});

if (isProd) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Multer / upload error handling
app.use((err, _req, res, _next) => {
  const msg = err?.message;
  if (typeof msg === "string") return res.status(400).json({ error: msg });
  return res.status(500).json({ error: "上傳失敗" });
});

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
  if (isProd) console.log(`Serving static from ${clientDist}`);
});
