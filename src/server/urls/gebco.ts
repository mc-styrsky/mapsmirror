import { LayerSetup } from '../../common/layers';
import { XYZ2Url } from './default';

export class XYZ2UrlGebco extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    this.local = true;
    const { max, min } = LayerSetup.get(params.provider);
    if (z >= min && z <= max) this.url = `./gebco/tiles/${z}/${x}/${y}.png`;
  }
}
