import type { ConstructorProps } from '../../common/types/constructorProps';
import { XYZ2Url } from './default';

export class XYZ2UrlGebco extends XYZ2Url {
  constructor (params: ConstructorProps<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    this.local = true;
    if (z >= 2 && z <= 9) this.url = `./gebco/tiles/${z}/${x}/${y}.png`;
  }
}
