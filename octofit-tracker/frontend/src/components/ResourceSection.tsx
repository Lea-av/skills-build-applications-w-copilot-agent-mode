import type { ReactNode } from 'react';
import type { ListState } from '../api/useApiList.js';

type Props<T> = {
  title: string;
  state: ListState<T>;
  loadingText: string;
  errorText: string;
  emptyText: string;
  children: (items: T[]) => ReactNode;
};

export function ResourceSection<T>({ title, state, loadingText, errorText, emptyText, children }: Props<T>) {
  return (
    <section aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`} className="h3 mb-3">{title}</h2>
      {state.status === 'loading' && <p role="status" className="text-secondary">{loadingText}</p>}
      {state.status === 'error' && <p role="alert" className="alert alert-danger">{errorText}</p>}
      {state.status === 'success' && state.items.length === 0 && <p className="text-secondary">{emptyText}</p>}
      {state.status === 'success' && state.items.length > 0 && children(state.items)}
    </section>
  );
}
