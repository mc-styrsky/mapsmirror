import { x2lonCommon } from '../../common/x2lon';
import { position } from '../globals/position';

export function x2lon (x: number, tiles = position.tiles) {
  return x2lonCommon(x, tiles);
}
