/** 對應商品卡 badge，後台可填英文 key */
export type ProductBadgeKey =
  | "bestseller"
  | "recommended"
  | "seasonal"
  | "fresh"
  | "popular"
  | "limited";

export type Product = {
  id: string;
  name: string;
  tag: string;
  /** 短句賣點，顯示於標題下 */
  highlight?: string;
  description: string;
  price: number;
  /** 劃線參考價（可選，促銷感） */
  compareAtPrice?: number;
  imageUrl: string;
  badge?: ProductBadgeKey | "";
};

export const BADGE_LABELS: Record<ProductBadgeKey, string> = {
  bestseller: "熱賣",
  recommended: "店主推薦",
  seasonal: "季節限定",
  fresh: "新鮮製作",
  popular: "最受歡迎",
  limited: "限量供應",
};
