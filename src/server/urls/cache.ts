import type { ConstructorParameters } from "../../common/types/constructorParameters";
import { XYZ2Url } from './default';

export class XYZ2UrlCache extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 9) this.url = `./cache/tiles/${z}/${x}/${y}.png`;
    this.local = true;
  }
}
