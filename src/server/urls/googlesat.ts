import type { ConstructorParameters } from '../../common/types/constructorParameters';
import { layers } from '../../common/layers';
import { XYZ2Url } from './default';
import { XYZ2UrlGooglehybrid } from './googlehybrid';

export class XYZ2UrlGooglesat extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    this.fallback = XYZ2UrlGooglehybrid;
    const { max, min } = layers[params.provider];
    if (z >= min && z <= max) this.url = `https://mt.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`;
  }
}
