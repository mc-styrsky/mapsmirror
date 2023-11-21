import type { XYZ } from '../common/types/xyz';
import { imagesMap } from './canvases/mapCanvas';
import { tileSize } from './index';
import { position } from './position';
import { frac } from './utils/frac';

export const drawImage = ({
  context, scale = 1, trans, ttl, usedImages, x, y, z,
}: XYZ & {
  context: CanvasRenderingContext2D;
  scale?: number;
  trans: Pick<XYZ, 'x' | 'y'>;
  ttl: number;
  usedImages: Set<string>;
}) => {
  const src = `/tile/${position.source}/${[
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
    context.drawImage(
      imageFromMap,
      sx, sy, sw, sw,
      x * tileSize + trans.x,
      y * tileSize + trans.y,
      tileSize,
      tileSize,
    );
    return Promise.resolve(true);
  }

  const img = new Image();
  img.src = src;
  const prom = new Promise(resolve => {
    img.onload = () => {
      imagesMap[src] = img;
      usedImages.add(src);
      context.drawImage(
        img,
        sx, sy, sw, sw,
        x * tileSize + trans.x,
        y * tileSize + trans.y,
        tileSize,
        tileSize,
      );
      resolve(true);
    };
    img.onerror = () => {
      resolve(z > 0 ?
        drawImage({
          context,
          scale: scale << 1,
          trans,
          ttl,
          usedImages,
          x, y, z: z - 1,
        }) :
        false,
      );
    };
  });
  return prom;
};
