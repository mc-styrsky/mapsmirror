import { LayerSetup } from '../../common/layers';
import { XYZ2Url } from './default';

export class XYZ2UrlVfdensity extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    const { max, min } = LayerSetup.get(params.provider);
    if (z >= min && z <= max) this.url = `https://density.tiles.vesselfinder.net/all/${z}/${x}/${y}.png`;
  }
}
