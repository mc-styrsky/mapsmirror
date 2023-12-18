import type { XYZ } from '../../../../../common/types/xyz';
import stringify from 'json-stable-stringify';
import { tileSize } from '../../../../globals/tileSize';
import { LocalStorageItem } from '../../../../utils/localStorageItem';
import { savedPositionsFromLocalStoreage } from '../../../../utils/savedPositionsFromLocalStoreage';
import { updateSavedPositionsList } from './updateSavedPositionsList';


export function editSavedPosition ({ func, x, y, z }: XYZ & { func: 'add' | 'delete'; }) {
  const list = new Set(savedPositionsFromLocalStoreage().map(e => stringify(e)));
  list[func](stringify({
    x: Math.round(x * tileSize),
    y: Math.round(y * tileSize),
    z,
  }));
  new LocalStorageItem<XYZ[]>('savedPositions').set([...list].map(e => JSON.parse(e)));
  updateSavedPositionsList();
}
