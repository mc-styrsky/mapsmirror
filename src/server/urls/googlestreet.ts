import type { ConstructorParameters } from '../../common/types/constructorParameters';
import { Layers } from '../../common/layers';
import { XYZ2Url } from './default';

export class XYZ2UrlGooglestreet extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    const { max, min } = Layers.get(params.provider);
    if (z >= min && z <= max) this.url = `https://mt.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`;
  }
}
