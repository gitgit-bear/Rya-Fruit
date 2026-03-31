import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../types/product";

type Line = { product: Product; qty: number };

type CartContextValue = {
  lines: Line[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ryaFruitCartV2";

function loadLines(): Line[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Line[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLines(lines: Line[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>(loadLines);

  const add = useCallback((product: Product) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.product.id === product.id);
      let next: Line[];
      if (i >= 0) {
        next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
      } else {
        next = [...prev, { product, qty: 1 }];
      }
      saveLines(next);
      return next;
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.product.id !== productId);
      saveLines(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const total = useMemo(
    () => lines.reduce((s, l) => s + l.product.price * l.qty, 0),
    [lines]
  );
  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  const value = useMemo(
    () => ({ lines, add, remove, clear, total, count }),
    [lines, add, remove, clear, total, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
