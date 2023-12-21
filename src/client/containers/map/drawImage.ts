import type { DrawImage } from '../../../common/types/drawImage';
import { layers } from '../../../common/layers';
import { tileSize } from '../../globals/tileSize';
import { imagesToFetch } from '../infoBox/imagesToFetch';
import { drawCachedImage } from './drawCachedImage';

export function drawImage ({
  context, source, ttl, x, y, z,
}: DrawImage): PromiseLike<boolean> {
  if (z < layers[source].min) return Promise.resolve(false);
  const src = `/tile/${source}/${[
    z,
    x.toString(16),
    y.toString(16),
  ].join('/')}?ttl=${ttl}`;

  imagesToFetch.add({ source, x, y, z });

  return new Promise(resolve => {
    const img = new Image();
    const onload = () => {
      context.drawImage(img, 0, 0);
      imagesToFetch.delete({ source, x, y, z });
      resolve(true);
    };
    const onerror = async () => {
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

        const success = draw();
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
      }
    };
    if (z > layers[source].max) onerror();
    else {
      img.src = src;
      img.onload = onload;
      img.onerror = onerror;
    }
  });
}
