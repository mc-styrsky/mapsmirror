import type { ConstructorParameters } from "../../common/types/constructorParameters";
import { XYZ2Url } from './default';

export class XYZ2UrlOpentopomap extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 17) this.url = `https://tile.opentopomap.org/${z}/${x}/${y}.png`;
  }
}
