import { LayerSetup } from '../../common/layers';
import { XYZ2Url } from './default';

export class XYZ2UrlOpenseamap extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    const { max, min } = LayerSetup.get(params.provider);
    if (z >= min && z <= max) this.url = `https://tiles.openseamap.org/seamark/${z}/${x}/${y}.png`;
  }
}
