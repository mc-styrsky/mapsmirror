import type { ConstructorProps } from '../../common/types/constructorProps';
import { XYZ2Url } from './default';

export class XYZ2UrlVfdensity extends XYZ2Url {
  constructor (params: ConstructorProps<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 20) this.url = `https://density.tiles.vesselfinder.net/all/${z}/${x}/${y}.png`;
  }
}
