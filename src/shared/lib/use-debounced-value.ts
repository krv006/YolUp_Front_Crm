import { useEffect, useState } from "react";

/**
 * Delays a fast-changing value (usually a search box) so list queries fire
 * once the user pauses typing instead of on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
