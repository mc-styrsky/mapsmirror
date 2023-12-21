import type { ConstructorParameters } from '../../common/types/constructorParameters';
import sharp from 'sharp';
import { tileSize } from '../../client/globals/tileSize';
import { layers } from '../../common/layers';
import { XYZ2Url } from './default';

export class XYZ2UrlWorthit extends XYZ2Url {
  constructor (params: ConstructorParameters<typeof XYZ2Url>[0]) {
    super(params);
    const { x, y, z } = this;
    const { max, min } = layers[params.provider];
    if (z >= min && z <= max) this.url = `./worthit/tiles/${z}/${x}/${y}.png`;
  }
  fetchFromTileServer = async () => {
    const { x, y, z } = this;
    const tile = new Uint8Array(3 * tileSize * tileSize);
    for (let zi = 0; zi <= 8; zi++) {
      const color = zi > 4 ?
        [0, Math.min(0x20 << zi - 4, 0xff), 0] :
        zi > 0 ?
          [0, 0, Math.min(0x20 << zi - 1, 0xff)] :
          [Math.min(0x40 << zi, 0xff), 0, 0];
      for (let yi = 0; yi < 1 << zi; yi++) {
        const yiOffset = yi << 8 - zi;
        for (let xi = 0; xi < 1 << zi; xi++) {
          const xiOffset = xi << 8 - zi;
          const [cr, cg, cb] = await this.worthItArea({
            x: (x << zi) + xi,
            y: (y << zi) + yi,
            z: z + zi,
          }) ? color : [0, 0];
          if (cr || cg || cb) {
            for (let row = 0; row < 1 << 8 - zi; row++) {
              for (let col = 0; col < 1 << 8 - zi; col++) {
                const pos = ((yiOffset + row) * 256 + (xiOffset + col)) * 3;
                tile[pos] = cr;
                tile[pos + 1] = cg;
                tile[pos + 2] = cb;
              }
            }
          }
        }
      }
    }
    const body = await sharp(tile, {
      raw: {
        channels: 3,
        height: 256,
        width: 256,
      },
    })
    .png()
    .toBuffer();
    return {
      body,
      status: 200,
    };
  };
}
