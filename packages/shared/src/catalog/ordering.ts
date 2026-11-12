/** A copy of `items` with the item at `from` moved to `to`. Out-of-range moves return a copy unchanged. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const copy = [...items];
  if (from < 0 || from >= copy.length || to < 0 || to >= copy.length || from === to) return copy;
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item as T);
  return copy;
}
