import type { XYZ } from '../../common/types/xyz';
import sharp from 'sharp';
import { getTileParams } from './getTileParams';

const worthItDatabase: {
  min: Record<string, Record<string, Record<string, Buffer>>>,
  max: Record<string, Record<string, Record<string, Buffer>>>,
} = {
  max: {},
  min: {},
};

const populateDatabase = (z: number, base: Buffer, func: 'min' | 'max') => {
  ((worthItDatabase[func][z] ??= {})[0] ??= {})[0] = base;
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

populateDatabase(0, await sharp('tiles/gebcomax/0/00.png').greyscale().toFormat('raw').toBuffer(), 'max');

populateDatabase(0, await sharp('tiles/gebcomin/0/00.png').greyscale().toFormat('raw').toBuffer(), 'min');

console.log(worthItDatabase);

export const worthItMinMax = async ({ x, y, z }: XYZ): Promise<{ min: number; max: number; } | null> => {
  while (x < 0) x += 1 << z;
  while (y < 0) y += 1 << z;
  if (z > 17) {
    x = x >> z - 17;
    y = y >> z - 17;
    z = 17;
  }
  if (y >= (1 << z) / 4 * 3) return null;
  const z8 = z - 8;
  const x8 = x >> 8;
  const y8 = y >> 8;
  const tileMax = worthItDatabase.max[z8]?.[x8]?.[y8];
  const tileMin = worthItDatabase.min[z8]?.[x8]?.[y8];

  if (tileMin && tileMax) {
    const pos = (x & 0xff) + (y & 0xff) * 256;
    const max = tileMax[pos];
    const min = tileMin[pos];
    return { max, min };
  }

  const { tileId } = getTileParams({ x: x8, y: y8, z: z8 });

  if (z8 < 0) console.log({ tileId, x, x8, y, y8, z, z8 });
  const path = `${z8.toString(36)}/${tileId}`;
  ((worthItDatabase.max[z8] ??= {})[x8] ??= {})[y8] = await sharp(`tiles/gebcomax/${path}.png`).greyscale().toFormat('raw').toBuffer();
  ((worthItDatabase.min[z8] ??= {})[x8] ??= {})[y8] = await sharp(`tiles/gebcomin/${path}.png`).greyscale().toFormat('raw').toBuffer();
  return worthItMinMax({ x, y, z });
};
