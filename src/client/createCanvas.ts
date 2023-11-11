import { port } from '../common/consts';
import { createHTMLElement } from './createHTMLElement';
import { crosshairs } from './crosshairs';
import { position, tileSize } from './index';

const imagesMap: Record<string, HTMLImageElement> = {};

export const createCanvas = async ({
  height, width, x, y, z,
}: {
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
}) => {
  const canvas = createHTMLElement({
    style: {
      height: `${height}px`,
      width: `${width}px`,
    },
    tag: 'canvas',
  });
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const translate = {
    x: Math.round(width / 2 - x * tileSize),
    y: Math.round(height / 2 - y * tileSize),
  };
  context.translate(
    translate.x,
    translate.y,
  );
  const maxdx = Math.ceil((width - translate.x) / tileSize);
  const maxdy = Math.ceil((height - translate.y) / tileSize);
  const mindx = -Math.ceil(translate.x / tileSize);
  const mindy = -Math.ceil(translate.y / tileSize);

  const dxArray: number[] = [];
  for (let dx = mindx; dx < maxdx; dx++) dxArray.push(dx);
  const dyArray: number[] = [];
  for (let dy = mindy; dy < maxdy; dy++) {
    if (dy >= 0 && dy < position.tiles) dyArray.push(dy);
  }

  const usedImages: Set<string> = new Set();

  await Promise.all(dxArray.map(async (dx) => {
    await Promise.all(dyArray.map(dy => {
      const src = `http://localhost:${port}/tile/${position.source}/${[
        z,
        Math.floor(dx).toString(16),
        Math.floor(dy).toString(16),
      ].join('/')}?ttl=${position.ttl}`;

      const imageFromMap = imagesMap[src];
      if (imageFromMap) {
        usedImages.add(src);
        context.drawImage(
          imageFromMap,
          dx * tileSize,
          dy * tileSize,
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
            dx * tileSize,
            dy * tileSize,
            tileSize,
            tileSize,
          );
          resolve(true);
        };
        img.onerror = () => resolve(false);
      });
      return prom;
    }));
  })).then(() => {
    Object.keys(imagesMap).forEach(src => {
      if (!usedImages.has(src)) delete imagesMap[src];
    });
    crosshairs(canvas, context);
  });
  return canvas;
};
