import { x2lonCommon } from '../../common/x2lon';
import { position } from '../globals/position';

export const x2lon = (x: number, tiles = position.tiles) => x2lonCommon(x, tiles);
