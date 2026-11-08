import { useEffect, useState } from 'react';
import { getJson } from './client.js';

export type ListState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; items: T[] };

// Each API list response wraps its array under a named key, for example { activities: [...] }.
export function useApiList<T>(path: string, key: string): ListState<T> {
  const [state, setState] = useState<ListState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<Record<string, T[]>>(path)
      .then((payload) => {
        if (active) setState({ status: 'success', items: payload[key] ?? [] });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [path, key]);

  return state;
}
