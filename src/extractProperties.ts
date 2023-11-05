export function extractProperties<T extends object> (
  obj: Record<string, any>,
  builder: { [P in keyof T]: (val?: any) => T[P] },
): T {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor]: [string, any] = entry;
    ret[key] = constructor(obj[key]);
    return ret;
  }, {} as T);
}
