import { PI2, asinh, tan } from '../../common/math';
import { position } from '../globals/position';

export function lat2y (lat: number, tiles = position.tiles) {
  return (0.5 - asinh(tan(lat)) / PI2) * tiles;
}
