'use client';

import { useEffect, useState } from 'react';

/**
 * Track the user's `prefers-reduced-motion` setting. Defaults to `true`
 * (motion reduced) during SSR/first paint so anxious users never get a flash
 * of animation before the preference is read.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}
