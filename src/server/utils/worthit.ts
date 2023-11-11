import sharp from 'sharp';
import { getTileParams } from './getTileParams';

const worthItDatabase: Record<string, Buffer> = {};

const populateDatabase = (z: number, base: Buffer, func: 'min' | 'max') => {
  worthItDatabase[`${z.toString(36)}/${func}`] = base;
  if (z < -8) return;
  const cmp = Math[func];
  const nextBase = Buffer.alloc(256 * 256, 0);
  for (let x = 0; x < 128; x++) {
    for (let y = 0; y < 128; y++) {
      nextBase[y * 256 + x] = cmp(
        base[y * 2 * 256 + x * 2],
        base[(y * 2 + 1) * 256 + x * 2],
        base[y * 2 * 256 + (x * 2 + 1)],
        base[(y * 2 + 1) * 256 + (x * 2 + 1)],
      );
    }
  }
  populateDatabase(z - 1, nextBase, func);
};

populateDatabase(0, await sharp('tiles/gebco/0/00.png').greyscale().toFormat('raw').toBuffer(), 'max');

populateDatabase(0, await sharp('tiles/gebcomin/0/00.png').greyscale().toFormat('raw').toBuffer(), 'min');

console.log(worthItDatabase);

export const worthIt = async ({ x, y, z }: { x: number; y: number; z: number; }) => {
  if (z > 17) {
    x = x >> z - 17;
    y = y >> z - 17;
    z = 17;
  }
  if (y >= (1 << z) / 4 * 3) return false;
  const { tileId } = getTileParams({ x, y, z });
  const tileParts = tileId.split('/');
  tileParts.pop();
  tileParts.pop();

  const path = `${(z - 8).toString(36)}/${tileParts.join('/')}`;
  worthItDatabase[`${path}max`] ||= await sharp(`tiles/gebco/${path}.png`).greyscale().toFormat('raw').toBuffer();
  worthItDatabase[`${path}min`] ||= await sharp(`tiles/gebcomin/${path}.png`).greyscale().toFormat('raw').toBuffer();

  const tileMax = worthItDatabase[`${path}max`];
  const tileMin = worthItDatabase[`${path}min`];
  const pos = (x & 0xff) + (y & 0xff) * 256;
  const max = tileMax[pos];
  const min = tileMin[pos];
  // return max > 64;
  return max > 96 && min < 144;
};
