/**
 * Form → API payload helpers.
 *
 * `<input>` and `<select>` hand back `""` for "left blank", which is neither
 * `null` nor `undefined`. Sending `""` for an optional field makes DRF reject
 * dates/numbers/enums, so blank strings are dropped before the request.
 */

/** Remove keys whose value is an empty string (axios then omits `undefined`). */
export function stripEmpty(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value === "" ? undefined : value]),
  );
}

/** `1 200 000` so'm → `120_000_000` tiyin (backend stores tiyin). */
export function somToTiyin(som: number): number {
  return Math.round(som * 100);
}

/** `120_000_000` tiyin → `1 200 000` so'm, for prefilling edit forms. */
export function tiyinToSom(tiyin: number | null | undefined): number {
  return Math.round((tiyin ?? 0) / 100);
}
