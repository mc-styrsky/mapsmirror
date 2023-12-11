import type { ConstructorProps } from '../../common/types/constructorProps';
import { XYZ2Url } from './default';

export class XYZ2UrlGooglestreet extends XYZ2Url {
  constructor (params: ConstructorProps<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 20) this.url = `https://mt.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`;
  }
}
