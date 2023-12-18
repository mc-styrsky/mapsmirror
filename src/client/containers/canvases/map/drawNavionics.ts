import { tileSize } from '../../../globals/tileSize';
import { imagesToFetch } from '../../infoBox/imagesToFetch';
import { drawImage } from './drawImage';
import { navionicsWatermark } from './navionicsWatermark';

const backgroundColors = [
  0x20b0f8,
  // 0x38b8f8,
  // 0x48c0f8,
  // 0x50c0f8,
  // 0x58c0f8,
  // 0x58c8f8,
  // 0x60c8f8,
  // 0x68c8f8,
  // 0x70c8f8,
  // 0x78d0f8,
  // 0x80d0f8,
  // 0x88d0f8,
  // 0x88d8f8,
  // 0x90d8f8,
  // 0x98d8f8,
  // 0xa0d8f8,
  // 0xa8e0f8,
  // 0xb0e0f8,
  // 0xb8e0f8,
  // 0xc0e8f8,
  0xf8f8f8,
  0x98c800,
].reduce((arr, val) => {
  const r = val >> 16;
  const g = val >> 8 & 0xff;
  const b = val & 0xff;
  const diff = 1;
  const alpha = val === 0x98c800 ? 0x40 : 0;

  for (let dr = -diff; dr <= diff; dr++) {
    for (let dg = -diff; dg <= diff; dg++) {
      for (let db = -diff; db <= diff; db++) {
        arr.set((r + dr << 16) + (g + dg << 8) + b + db, alpha);
      }
    }
  }
  return arr;
}, new Map<number, number>());

export async function drawNavionics ({ context, source, ttl, x, y, z }) {
  const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
  const workerContext = workerCanvas.getContext('2d');
  const watermark = await navionicsWatermark;
  if (!workerContext || !watermark) return false;


  const drawProm = drawImage({ context: workerContext, source, ttl, x, y, z });
  const draw = await drawProm;
  if (!draw) return false;
  imagesToFetch.add({ source: 'transparent', x, y, z });
  const img = workerContext.getImageData(0, 0, tileSize, tileSize);

  const { data } = img;
  for (let i = 0; i < watermark.length; i++) {
    const mask = watermark[i];
    const subData = data.subarray(i * 4, i * 4 + 4);
    const [r, g, b, a] = subData.map(v => v * 0xf8 / mask);
    const color = (r << 16) + (g << 8) + b;
    subData[0] = r;
    subData[1] = g;
    subData[2] = b;
    subData[3] = backgroundColors.get(color) ?? a;
  }
  workerContext.putImageData(img, 0, 0);
  imagesToFetch.delete({ source: 'transparent', x, y, z });

  context.drawImage(workerCanvas, 0, 0);
  return true;
}
