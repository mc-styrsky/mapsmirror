import { entriesTyped } from './entriesTyped';

export function castObject<T extends object> (
  obj: unknown,
  transformer: { [P in keyof T]: (val?: unknown) => T[P] },
): T {
  const objSave = Object(obj) as object;
  return entriesTyped(transformer).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(objSave[key]);
    return ret;
  }, {} as T);
}
