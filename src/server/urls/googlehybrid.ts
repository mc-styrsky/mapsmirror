import type { ConstructorParameters } from '../../common/types/constructorParameters';
import { layers } from '../../common/layers';
import { XYZ2Url } from './default';

export class XYZ2UrlGooglehybrid extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    const { max, min } = layers[params.provider];
    if (z >= min && z <= max) this.url = `https://mt.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`;
  }
}
