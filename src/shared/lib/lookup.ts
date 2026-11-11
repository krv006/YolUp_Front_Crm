/**
 * ID → nom xaritalari. Backend ro'yxatlari faqat `*_id` qaytaradi,
 * shuning uchun jadvalda UUID o'rniga nom ko'rsatish uchun ishlatiladi.
 */

/** Ro'yxatdan `{ id: label }` xaritasini yasaydi. */
export function buildLookup<T extends { id: string }>(
  items: T[] | undefined | null,
  getLabel: (item: T) => string,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of items ?? []) {
    map[item.id] = getLabel(item);
  }
  return map;
}

/** Xaritadan qiymat oladi; topilmasa `fallback`. */
export function fromLookup(
  map: Record<string, string>,
  id: string | null | undefined,
  fallback = "—",
): string {
  if (!id) return fallback;
  return map[id] ?? fallback;
}
