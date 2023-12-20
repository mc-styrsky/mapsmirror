import type { ConstructorParameters } from "../../common/types/constructorParameters";
import { XYZ2Url } from './default';
import { XYZ2UrlGooglehybrid } from './googlehybrid';

export class XYZ2UrlGooglesat extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    this.fallback = XYZ2UrlGooglehybrid;
    if (z >= 2 && z <= 20) this.url = `https://mt.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`;
  }
}
