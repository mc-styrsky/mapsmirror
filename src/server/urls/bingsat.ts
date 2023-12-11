import type { ConstructorProps } from '../../common/types/constructorProps';
import { xyz2quadkey } from '../utils/xyz2quadkey';
import { XYZ2Url } from './default';

export class XYZ2UrlBingsat extends XYZ2Url {
  constructor (params: ConstructorProps<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 20) this.url = `https://t.ssl.ak.tiles.virtualearth.net/tiles/a${xyz2quadkey({ x, y, z })}.jpeg?g=14041&n=z&prx=1`;
  }
}
