import type { XYZ } from '../../common/types/xyz';
import { LocalStorageItem } from './localStorageItem';

export function savedPositionsFromLocalStoreage () {
  const storageItem = new LocalStorageItem<XYZ[]>('savedPositions');
  const list = storageItem.get();
  console.log(list);
  if (Array.isArray(list)) {
    if (list.every(item => {
      const check = item.x + item.y + item.z;
      return typeof check === 'number' && !Number.isNaN(check);
    })) return list;
    console.log('x, y, or z is NaN', list);
  }
  else console.log('savedPositions not an array');
  storageItem.set([]);
  return [];
}
