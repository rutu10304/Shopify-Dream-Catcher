import { CartItem, Product } from "@/types/product";

const CART_KEY = "rc_cart";

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch (e) {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
}

export function addToCart(product: Product): CartItem[] {
  const items = getCart();
  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    const updated = items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    saveCart(updated);
    return updated;
  }

  const newItem: CartItem = { ...product, quantity: 1 };
  const updated = [...items, newItem];
  saveCart(updated);
  return updated;
}

export function removeFromCart(id: string): CartItem[] {
  const items = getCart();
  const updated = items.filter((i) => i.id !== id);
  saveCart(updated);
  return updated;
}

export function updateQuantity(id: string, quantity: number): CartItem[] {
  const items = getCart();
  const updated = items.map((i) => (i.id === id ? { ...i, quantity } : i)).filter(Boolean);
  saveCart(updated);
  return updated;
}

export function clearCart(): void {
try {
  localStorage.removeItem(CART_KEY);
} catch (e) {
  // ignore
}
}

export function addToWishlist(product: Product): Product[] {
  // Add to wishlist without requiring login
  const WISHLIST_KEY = "wishlist";
  try {
    const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    const existingIndex = wishlist.findIndex((item: Product) => item.id === product.id);
    
    if (existingIndex === -1) {
      // Add to wishlist if not already there
      wishlist.push(product);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } else {
      // Remove from wishlist if already there
      wishlist.splice(existingIndex, 1);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
    
    return wishlist;
  } catch (e) {
    return [];
  }
}

export function getWishlist(): Product[] {
  const WISHLIST_KEY = "wishlist";
  try {
    const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    return wishlist;
  } catch (e) {
    return [];
  }
}

export function removeFromWishlist(productId: string): Product[] {
  const WISHLIST_KEY = "wishlist";
  try {
    const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    const updated = wishlist.filter((item: Product) => item.id !== productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}
