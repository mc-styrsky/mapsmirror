import type { XYZ } from '../../../../../common/types/xyz';
import stringify from 'json-stable-stringify';
import { tileSize } from '../../../../globals/tileSize';
import { savedPositionsFromLocalStoreage } from '../../../../utils/savedPositionsFromLocalStoreage';
import { updateSavedPositionsList } from './updateSavedPositionsList';


export function editSavedPosition ({ func, x, y, z }: XYZ & { func: 'add' | 'delete'; }) {
  const list = new Set(savedPositionsFromLocalStoreage().map(e => stringify(e)));
  list[func](stringify({
    x: Math.round(x * tileSize),
    y: Math.round(y * tileSize),
    z,
  }));
  window.localStorage.setItem('savedPositions', stringify([...list].map(e => JSON.parse(e))));
  updateSavedPositionsList();
}
