export function mergeAlertIds(
  prev: string[],
  incoming: (string | null | undefined)[],
  done: ReadonlySet<string>
): string[] {
  const fresh = incoming.filter((id): id is string => !!id && !done.has(id));
  if (fresh.length === 0) return prev;
  return [...new Set([...prev, ...fresh])];
}

export function dropAlertIds(prev: string[], ids: (string | null | undefined)[]): string[] {
  const drop = new Set(ids.filter((id): id is string => !!id));
  return prev.filter((id) => !drop.has(id));
}

/**
 * Reconcile alert claims against the current actionable server state.
 * Returns exactly `current` minus ids already acknowledged/done — any stale id
 * that is no longer actionable (advancing, paid, cancelled, gated) is dropped
 * so the alert loop cannot keep ringing forever.
 */
export function reconcileAlertIds(
  current: (string | null | undefined)[],
  done: ReadonlySet<string>
): string[] {
  return current.filter((id): id is string => !!id && !done.has(id));
}

/**
 * Keep only alert claims that are still actionable. Used to reconcile the
 * waiter's payment-claim set against the set of currently-CLAIMED orders.
 */
export function retainAlertIds(prev: string[], allowed: ReadonlySet<string>): string[] {
  return prev.filter((id) => allowed.has(id));
}