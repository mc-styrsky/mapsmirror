import type { Size } from '../../common/types/size';
import type { XYZ } from '../../common/types/xyz';
import { createHTMLElement } from '../createHTMLElement';
import { drawImage } from '../drawImage';
import { tileSize } from '../index';
import { position } from '../position';

export const imagesMap: Record<string, HTMLImageElement> = {};

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
  const maxdx = Math.ceil((width - trans.x) / tileSize);
  const maxdy = Math.ceil((height - trans.y) / tileSize);
  const mindx = - Math.ceil(trans.x / tileSize);
  const mindy = - Math.ceil(trans.y / tileSize);

  const dxArray: number[] = [];
  for (let dx = mindx; dx < maxdx; dx++) dxArray.push(dx);
  const dyArray: number[] = [];
  for (let dy = mindy; dy < maxdy; dy++) {
    if (dy >= 0 && dy < position.tiles) dyArray.push(dy);
  }

  const usedImages: Set<string> = new Set();

  const ttl = Math.max(Math.min(17, z + Math.max(1, position.ttl)) - z, 0);
  await Promise.all(dxArray.map(async (dx) => {
    await Promise.all(dyArray.map(dy => {
      return drawImage({ context, trans, ttl, usedImages, x: dx, y: dy, z });
    }));
  })).then(() => {
    Object.keys(imagesMap).forEach(src => {
      if (!usedImages.has(src)) delete imagesMap[src];
    });
  });
  return canvas;
};
