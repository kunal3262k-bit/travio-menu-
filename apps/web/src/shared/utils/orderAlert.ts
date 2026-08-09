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