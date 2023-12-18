import { position } from '../globals/position';
import { tileSize } from '../globals/tileSize';


export function px2nm (lat: number) {
  const stretch = 1 / Math.cos(lat);
  return 360 * 60 / position.tiles / tileSize / stretch;
}
