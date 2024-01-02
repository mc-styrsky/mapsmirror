import { cos } from '../../common/math';
import { position } from '../globals/position';
import { tileSize } from '../globals/tileSize';

export function nm2px (lat: number) {
  const stretch = 1 / cos(lat);
  return position.tiles * tileSize / 360 / 60 * stretch;
}
