import type { DrawImage } from '../../../../common/types/drawImage';
import { tileSize } from '../../../globals/tileSize';
import { frac } from '../../../utils/frac';
import { imagesToFetch } from '../../infoBox/imagesToFetch';

export function drawImage ({
  context, scale = 1, source, ttl, x, y, z,
}: DrawImage): PromiseLike<boolean> {
  if (z < 2) return Promise.resolve(false);
  if (source === 'vfdensity' && z < 3) return Promise.resolve(false);
  const src = `/tile/${source}/${[
    z,
    Math.floor(x / scale).toString(16),
    Math.floor(y / scale).toString(16),
  ].join('/')}?ttl=${ttl}`;

  const sx = Math.floor(frac(x / scale) * scale) * tileSize / scale;
  const sy = Math.floor(frac(y / scale) * scale) * tileSize / scale;
  const sw = tileSize / scale;

  imagesToFetch.add({ source, x, y, z });
  const img = new Image();
  img.src = src;
  const prom: Promise<boolean> = new Promise(resolve => {
    img.onload = () => {
      context.drawImage(
        img,
        sx, sy, sw, sw,
        0, 0,
        tileSize, tileSize,
      );
      resolve(true);
      imagesToFetch.delete({ source, x, y, z });
    };
    img.onerror = () => {
      resolve(z > 0 ?
        drawImage({
          context,
          scale: scale << 1,
          source,
          ttl,
          x, y, z: z - 1,
        }) :
        false,
      );
      imagesToFetch.delete({ source, x, y, z });
    };
  });
  return prom;
}
