import type { XYZ } from '../../common/types/xyz';
import { imagesMap } from '../canvases/mapCanvas';
import { tileSize } from '../index';
import { frac } from './frac';

export const drawImage = ({
  alpha, context, scale = 1, source, trans, ttl, usedImages, x, y, z,
}: XYZ & {
  alpha: number
  context: CanvasRenderingContext2D;
  scale?: number;
  source: string;
  trans: Pick<XYZ, 'x' | 'y'>;
  ttl: number;
  usedImages: Set<string>;
}): PromiseLike<() => boolean> => {
  const src = `/tile/${source}/${[
    z,
    Math.floor(x / scale).toString(16),
    Math.floor(y / scale).toString(16),
  ].join('/')}?ttl=${ttl}`;

  const sx = Math.floor(frac(x / scale) * scale) * tileSize / scale;
  const sy = Math.floor(frac(y / scale) * scale) * tileSize / scale;
  const sw = tileSize / scale;
  const imageFromMap = imagesMap[src];
  if (imageFromMap) {
    usedImages.add(src);
    return Promise.resolve(() => {
      context.globalAlpha = alpha;
      context.drawImage(
        imageFromMap,
        sx, sy, sw, sw,
        x * tileSize + trans.x,
        y * tileSize + trans.y,
        tileSize,
        tileSize,
      );
      return true;
    });
  }

  const img = new Image();
  img.src = src;
  const prom: Promise<() => boolean> = new Promise(resolve => {
    img.onload = () => {
      imagesMap[src] = img;
      usedImages.add(src);
      resolve(() => {
        context.globalAlpha = alpha;
        context.drawImage(
          img,
          sx, sy, sw, sw,
          x * tileSize + trans.x,
          y * tileSize + trans.y,
          tileSize,
          tileSize,
        );
        return true;
      });
    };
    img.onerror = () => {
      resolve(z > 0 ?
        drawImage({
          alpha,
          context,
          scale: scale << 1,
          source,
          trans,
          ttl,
          usedImages,
          x, y, z: z - 1,
        }) :
        () => false,
      );
    };
  });
  return prom;
};
