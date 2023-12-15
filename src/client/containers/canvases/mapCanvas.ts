import type { Size } from '../../../common/types/size';
import type { XYZ } from '../../../common/types/xyz';
import { position } from '../../globals/position';
import { settings } from '../../globals/settings';
import { tileSize } from '../../globals/tileSize';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { drawCachedImage } from './map/drawCachedImage';

const imagesLastUsed: Set<string> = new Set();

export const imagesMap: Record<string, PromiseLike<OffscreenCanvas | null>> = {};
export const createMapCanvas = async ({
  height, width, x, y, z,
}: XYZ & Size) => {
  const canvasWidth = width + 2 * tileSize;
  const canvasHeight = height + 2 * tileSize;
  const canvas = createHTMLElement({
    style: {
      height: `${canvasHeight}px`,
      left: `${-tileSize}px`,
      position: 'absolute',
      top: `${-tileSize}px`,
      width: `${canvasWidth}px`,
    },
    tag: 'canvas',
  });
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  context.translate(tileSize, tileSize);
  const trans = {
    x: Math.round(width / 2 - x * tileSize),
    y: Math.round(height / 2 - y * tileSize),
  };

  const marginTiles = 1;
  const maxdx = Math.ceil((width - trans.x) / tileSize);
  const maxdy = Math.ceil((height - trans.y) / tileSize);
  const mindx = - Math.ceil(trans.x / tileSize);
  const mindy = - Math.ceil(trans.y / tileSize);

  const dxArray: {dx: number, marginX: boolean}[] = [];
  for (let dx = mindx - marginTiles; dx < maxdx + marginTiles; dx++) {
    dxArray.push({ dx, marginX: dx < mindx || dx > maxdx });
  }
  const dyArray: {dy: number, marginY: boolean}[] = [];
  for (let dy = mindy - marginTiles; dy < maxdy + marginTiles; dy++) {
    if (dy >= 0 && dy < position.tiles) dyArray.push({ dy, marginY: dy < mindy || dy > maxdy });
  }

  const usedImages: Set<string> = new Set();

  const ttl = Math.max(Math.min(17, z + Math.max(0, position.ttl)) - z, 0);
  const neededTileProms: Promise<void>[] = [];
  const optionalTileProms: Promise<void>[] = [];
  dxArray.map(({ dx, marginX }) => {
    dyArray.map(({ dy, marginY }) => {
      (marginX || marginY ? optionalTileProms : neededTileProms).push(
        settings.tiles.order.reduce(async (prom, entry) => {
          const { alpha, source } = typeof entry === 'string' ? { alpha: 1, source: entry } : entry;
          if (source && settings.tiles.enabled[source]) {
            const draw = drawCachedImage({ alpha, context, source, trans, ttl: marginX || marginY ? 0 : ttl, usedImages, x: dx, y: dy, z });
            await prom;
            await (await draw)();
          }
          return prom;
        }, Promise.resolve()),
      );
    });
  });

  await Promise.all(neededTileProms);
  Promise.all(optionalTileProms)
  .then(() => Promise.all(neededTileProms))
  .then(() => {
    usedImages.forEach(i => {
      imagesLastUsed.delete(i);
      imagesLastUsed.add(i);
    });
    [...imagesLastUsed].slice(0, -1000).forEach(src => {
      delete imagesMap[src];
      imagesLastUsed.delete(src);
    });
  });
  return canvas;
};
