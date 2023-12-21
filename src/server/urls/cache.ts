import type { ConstructorParameters } from '../../common/types/constructorParameters';
import { layers } from '../../common/layers';
import { XYZ2Url } from './default';

export class XYZ2UrlCache extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    const { max, min } = layers[params.provider];
    if (z >= min && z <= max) this.url = `./cache/tiles/${z}/${x}/${y}.png`;
    this.local = true;
  }
}
