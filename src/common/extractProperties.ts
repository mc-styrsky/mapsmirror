import { entriesTyped } from './fromEntriesTyped';

export function castObject<T extends object> (
  obj: any,
  transformer: { [P in keyof T]: (val?: unknown) => T[P] },
): T {
  const objSave = Object(obj) as object;
  return entriesTyped(transformer).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(objSave[key]);
    return ret;
  }, {} as T);
}
