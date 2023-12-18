import type { DrawImage } from '../../../../common/types/drawImage';
import type { XYZ } from '../../../../common/types/xyz';
import { modulo } from '../../../../common/modulo';
import { position } from '../../../globals/position';
import { tileSize } from '../../../globals/tileSize';
import { imagesMap } from '../mapCanvas';
import { drawImage } from './drawImage';
import { drawNavionics } from './drawNavionics';


export async function drawCachedImage ({
  alpha, context, source, trans, ttl, usedImages, x, y, z,
}: DrawImage & {
  alpha: number;
  trans: Pick<XYZ, 'x' | 'y'>;
  usedImages: Set<string>;
}): Promise<() => Promise<boolean>> {
  const isNavionics = source === 'navionics';
  const src = `/${source}/${[
    z,
    modulo(x, position.tiles).toString(16),
    modulo(y, position.tiles).toString(16),
  ].join('/')}`;

  const drawCanvas = (cnvs: OffscreenCanvas) => {
    usedImages.add(src);
    context.globalAlpha = alpha;
    context.drawImage(
      cnvs,
      x * tileSize + trans.x,
      y * tileSize + trans.y,
    );
  };

  const cachedCanvas = await imagesMap[src];
  if (cachedCanvas) return () => {
    drawCanvas(cachedCanvas);
    return Promise.resolve(true);
  };
  const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
  const workerContext = workerCanvas.getContext('2d');
  if (!workerContext) return () => Promise.resolve(true);


  const successProm = isNavionics ?
    drawNavionics({ context: workerContext, source, ttl, x, y, z }) :
    drawImage({ context: workerContext, source, ttl, x, y, z });

  imagesMap[src] = successProm.then(success => success ? workerCanvas : null);
  return async () => {
    const success = await successProm;
    if (success) {
      drawCanvas(workerCanvas);
    }

    return success;
  };
}
