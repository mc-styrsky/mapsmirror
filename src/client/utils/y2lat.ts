import { y2latCommon } from '../../common/y2lat';
import { position } from '../globals/position';

export const y2lat = (y: number, tiles = position.tiles) => y2latCommon(y, tiles);
