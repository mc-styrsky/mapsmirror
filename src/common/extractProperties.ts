export function castObject<T extends object> (
  obj: Record<string, any> | null | undefined,
  transformer: { [P in keyof T]: (val?: any) => T[P] },
): T {
  return Object.entries(transformer).reduce((ret, entry) => {
    const [key, constructor]: [string, any] = entry;
    ret[key] = constructor(obj?.[key]);
    return ret;
  }, {} as T);
}
