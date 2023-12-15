export function fromEntriesTyped<K extends string, T = any> (entries: Iterable<readonly [K, T]>): Record<K, T> {
  return Object.fromEntries(entries) as any;
}

export function entriesTyped<K extends string, T> (o: Record<K, T>): [K, T][] {
  return Object.entries(o) as any;
}
