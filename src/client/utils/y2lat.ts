import { y2latCommon } from '../../common/y2lat';
import { position } from '../globals/position';

export function y2lat (y: number, tiles = position.tiles) {
  return y2latCommon(y, tiles);
}
