import type { DrawImage } from '../../../common/types/drawImage';
import { modulo } from '../../../common/math';
import { position } from '../../globals/position';
import { tileSize } from '../../globals/tileSize';
import { drawImage } from './drawImage';
import { drawNavionics } from './drawNavionics';

const imagesMap: Record<string, PromiseLike<OffscreenCanvas | null> | undefined> = {};

export async function drawCachedImage (
  {
    alpha,
    context,
    source,
    ttl,
    x,
    y,
    z,
  }: DrawImage & { alpha: number; },
): Promise<() => true> {
  const isNavionics = source === 'navionics';
  const src = `/${source}/${[
    z,
    modulo(x, position.tiles).toString(16),
    modulo(y, position.tiles).toString(16),
  ].join('/')}`;

  const drawCanvas = (cnvs: OffscreenCanvas) => {
    context.globalAlpha = alpha;
    context.drawImage(cnvs, 0, 0);
  };

  const cachedCanvas = await imagesMap[src];
  if (cachedCanvas) return () => {
    drawCanvas(cachedCanvas);
    return true;
  };
  const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
  const workerContext = workerCanvas.getContext('2d');
  if (!workerContext) return () => true;


  const successProm = isNavionics ?
    drawNavionics({ context: workerContext, source, ttl, x, y, z }) :
    drawImage({ context: workerContext, source, ttl, x, y, z });

  imagesMap[src] = successProm.then(success => success ? workerCanvas : null);

  const success = await successProm;
  return () => {
    if (success) drawCanvas(workerCanvas);

    return true;
  };
}
