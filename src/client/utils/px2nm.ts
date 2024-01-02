import { cos } from '../../common/math';
import { position } from '../globals/position';
import { tileSize } from '../globals/tileSize';


export function px2nm (lat: number) {
  const stretch = 1 / cos(lat);
  return 360 * 60 / position.tiles / tileSize / stretch;
}
