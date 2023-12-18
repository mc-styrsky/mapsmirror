import type { XYZ } from '../../common/types/xyz';

export function savedPositionsFromLocalStoreage () {
  const list: XYZ[] = JSON.parse(window.localStorage.getItem('savedPositions') ?? '[]');
  console.log(list);
  if (Array.isArray(list)) {
    if (list.every(item => {
      const check = item.x + item.y + item.z;
      return typeof check === 'number' && !Number.isNaN(check);
    })) return list;
    console.log('x, y, or z is NaN', list);
  }
  else console.log('savedPositions not an array');
  window.localStorage.setItem('savedPositions', '[]');
  return [];
}
