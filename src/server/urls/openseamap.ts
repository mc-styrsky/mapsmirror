import type { ConstructorProps } from '../../common/types/constructorProps';
import { XYZ2Url } from './default';

export class XYZ2UrlOpenseamap extends XYZ2Url {
  constructor (params: ConstructorProps<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 18) this.url = `https://tiles.openseamap.org/seamark/${z}/${x}/${y}.png`;
  }
}
