import type { DeliveryConfig } from "../types/delivery";
import type { Product } from "../types/product";

export const staticProducts: Product[] = [
  {
    id: "fresh-fruit-cup",
    name: "御選生果杯",
    tag: "人氣首選",
    highlight: "當日現切 · 三至五款時令搭配",
    description:
      "每一杯皆以當日到貨水果現切現裝，酸甜層次分明，開蓋即食。若遇產地輪替，將以同等價位之時令果物替換，確保鮮度與風味。",
    price: 31,
    compareAtPrice: 36,
    imageUrl: "/favicon.svg",
    badge: "bestseller",
  },
  {
    id: "party-fruit-platter",
    name: "盛宴分享果盤",
    tag: "聚會送禮",
    highlight: "大份量體面呈現 · 適合 8-12 人",
    description:
      "適合派對、開幕、家庭聚餐。果物依季節編排色彩與口感，附建議擺盤與保冷提醒，讓桌面視覺與味覺同樣出色。",
    price: 240,
    imageUrl: "/favicon.svg",
    badge: "recommended",
  },
  {
    id: "deluxe-platter",
    name: "名選單人品果盤",
    tag: "精緻份量",
    highlight: "一人一份剛剛好 · 午茶與佐餐皆宜",
    description:
      "嚴選當季果物切片，口感清冽、香氣集中；適合午茶、飯後與輕奢小聚，亦適合作為心意伴手。",
    price: 43,
    compareAtPrice: 48,
    imageUrl: "/favicon.svg",
    badge: "fresh",
  },
  {
    id: "cold-press-juice",
    name: "冷萃慢磨果汁",
    tag: "加購推薦",
    highlight: "少氧化工法 · 與果杯一併下單最划算",
    description:
      "低溫慢磨保留果香與天然酸甜，無額外添加；與生果杯同溫層配送，適合辦公室午後與運動後補水。",
    price: 43,
    imageUrl: "/favicon.svg",
    badge: "popular",
  },
];

export const staticDeliveryConfig: DeliveryConfig = {
  settings: {
    freeShipThreshold: 500,
    cutOffTime: "18:00",
    leadDays: 1,
    note: "展示站版本：提交後會以 WhatsApp 人工確認配送與付款安排。",
    timeSlots: ["12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"],
  },
  zones: [
    { id: "hk-island", name: "港島區", fee: 40 },
    { id: "kowloon", name: "九龍區", fee: 35 },
    { id: "new-territories", name: "新界區", fee: 45 },
  ],
};
