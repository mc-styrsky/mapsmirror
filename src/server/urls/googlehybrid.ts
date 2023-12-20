import type { ConstructorParameters } from "../../common/types/constructorParameters";
import { XYZ2Url } from './default';

export class XYZ2UrlGooglehybrid extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 20) this.url = `https://mt.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`;
  }
}
