import { PI } from '../../common/math';
import { position } from '../globals/position';

export function lon2x (lon: number, tiles = position.tiles) {
  return (lon / PI / 2 + 0.5) * tiles;
}
