export function fromEntriesTyped<K extends string, T = any> (entries: Iterable<readonly [K, T]>): Record<K, T> {
  return Object.fromEntries(entries) as Record<K, T>;
}
