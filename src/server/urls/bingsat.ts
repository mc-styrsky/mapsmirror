import { LayerSetup } from '../../common/layers';
import { xyz2quadkey } from '../utils/xyz2quadkey';
import { XYZ2Url } from './default';

export class XYZ2UrlBingsat extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = params;
    const { max, min } = LayerSetup.get(params.provider);
    if (z >= min && z <= max) this.url = `https://t.ssl.ak.tiles.virtualearth.net/tiles/a${xyz2quadkey({ x, y, z })}.jpeg?g=14041&n=z&prx=1`;
  }
}
