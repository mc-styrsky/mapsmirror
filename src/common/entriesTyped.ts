
export function entriesTyped<K extends string, T> (o: Record<K, T>): [K, T][] {
  return Object.entries(o) as [K, T][];
}
