import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Return a new array with unique items based on the `id` property.
 * Keeps the last occurrence for any duplicated id.
 */
export function dedupeById<T extends { id: string }>(items: T[] | null | undefined): T[] {
  if (!items || items.length === 0) return [];
  // Map preserves insertion order; using Map will keep the last occurrence if we set repeatedly
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}
