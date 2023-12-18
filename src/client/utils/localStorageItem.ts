import stringify from 'json-stable-stringify';

export class LocalStorageItem<T = never> {
  constructor (key: string) {
    this.key = key;
  }
  key: string;
  set (val: T) {
    const newsettings = stringify(val);
    if (window.localStorage.getItem(this.key) !== newsettings) {
      window.localStorage.setItem(this.key, newsettings);
    }
  }
  get (): T | null {
    const val = window.localStorage.getItem(this.key);
    try {
      return val ? JSON.parse(val) : null;
    }
    catch {
      return null;
    }
  }
}
