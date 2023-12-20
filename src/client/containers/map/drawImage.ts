import type { DrawImage } from '../../../common/types/drawImage';
import { tileSize } from '../../globals/tileSize';
import { imagesToFetch } from '../infoBox/imagesToFetch';
import { drawCachedImage } from './drawCachedImage';

export function drawImage ({
  context, source, ttl, x, y, z,
}: DrawImage): PromiseLike<boolean> {
  if (z < 2) return Promise.resolve(false);
  if (source === 'vfdensity' && z < 3) return Promise.resolve(false);
  const src = `/tile/${source}/${[
    z,
    x.toString(16),
    y.toString(16),
  ].join('/')}?ttl=${ttl}`;

  imagesToFetch.add({ source, x, y, z });
  const img = new Image();
  img.src = src;
  const prom: Promise<boolean> = new Promise(resolve => {
    img.onload = () => {
      context.drawImage(img, 0, 0);
      imagesToFetch.delete({ source, x, y, z });
      resolve(true);
    };
    img.onerror = async () => {
      console.log('fallback', { source, x, y, z });
      const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
      const workerContext = workerCanvas.getContext('2d');
      if (workerContext) {
        const draw = await drawCachedImage({
          alpha: 1,
          context: workerContext,
          source,
          ttl,
          x: Math.floor(x / 2),
          y: Math.floor(y / 2),
          z: z - 1,
        });

        const success = await draw();
        if (success) context.drawImage(
          workerCanvas,
          (x & 1) * tileSize / 2,
          (y & 1) * tileSize / 2,
          tileSize / 2, tileSize / 2,
          0, 0, tileSize, tileSize,
        );
        imagesToFetch.delete({ source, x, y, z });
        resolve(success);
      }
      else {
        imagesToFetch.delete({ source, x, y, z });
        resolve(false);
        return;
      }
    };
  });
  return prom;
}
