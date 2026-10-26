import { useEffect, useState } from 'react';

/** Screens already loaded in this session (the prototype shows each skeleton once, like a cached query). */
const loaded = new Set<string>();

/**
 * Loading state for a screen's data. Prototype: true for `ms` on the first visit of `key` in the session.
 * With the API this becomes the query's pending flag (keep the same call sites).
 */
export function useFirstLoad(key: string, ms = 900) {
  const [loading, setLoading] = useState(() => !loaded.has(key));
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      loaded.add(key);
      setLoading(false);
    }, ms);
    return () => clearTimeout(t);
  }, [key, ms, loading]);
  return loading;
}
