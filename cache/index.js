import { StyQueue } from '@mc-styrsky/queue';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import sharp from 'sharp';

const queue = new StyQueue(128);

const cwd = '/home/sty/Documents/GitHub/mapsmirror/tiles/googlesat';
const outdir = '/home/sty/Documents/GitHub/mapsmirror/tiles/cache';

const xyz2filename = (x, y, z) => {
  const length = z + 3 >> 2;
  const pathX = x.toString(16).padStart(length, '0').split('');
  const pathY = y.toString(16).padStart(length, '0').split('');
  const file = `${pathX.pop()}${pathY.pop()}.png`;
  const path = `${z.toString(36)}/${pathX.map((_val, idx) => pathX[idx] + pathY[idx]).join('/')}`;
  const filename = `${path}/${file}`;
  return { file, filename, path };
};

console.time('exec ls');
execSync('ls -Rsh1 > /tmp/src.txt', { cwd });
console.timeEnd('exec ls');
console.time('read file');
const bashStdout = readFileSync('/tmp/src.txt', 'utf-8').split('\n');
console.timeEnd('read file');
console.time('parse file');
const files = {};
bashStdout.reduce((xyz, line) => {
  if (!line) return xyz;
  if (line[0] === '.') {
    const path = line.slice(2, -1);
    const parts = path.split('/');
    const z = parseInt(parts.shift(), 36);
    const length = z + 3 >> 2;

    if (parts.length === length - 1) {
      const [x, y] = parts.reduce(([x, y], part) => {
        x += parseInt(part[0], 16);
        y += parseInt(part[1], 16);
        x <<= 4;
        y <<= 4;
        return [x, y];
      }, [0, 0]);
      return [x, y, z];
    }
    return xyz;
  }
  if (line[0] === 't') return xyz;
  if (!line.endsWith('.png')) return xyz;
  const [xP, yP, z] = xyz;
  const [size, name] = line.trim().split(' ');
  const x = xP + parseInt(name[0], 16);
  const y = yP + parseInt(name[1], 16);
  ((files[z] ??= {})[x] ??= {})[y] = size;
  return xyz;
}, [0, 0, 0]);
console.timeEnd('parse file');
for (let z = 0; z <= 8; z++) {
  for (let y = 0; y < 1 << z; y++) {
    await queue.enqueue(() => null);
    console.log({ y, z });
    for (let x = 0; x < 1 << z; x++) {
      const tile = new Uint8Array(3 * 256 * 256);
      for (let zi = 0; zi <= 8; zi++) {
        const color = zi > 4 ?
          [Math.min(0x20 << zi - 5, 0xff), 0] :
          [0, Math.min(0x10 << zi, 0xff)];
        for (let yi = 0; yi < 1 << zi; yi++) {
          const yiOffset = yi << 8 - zi;
          for (let xi = 0; xi < 1 << zi; xi++) {
            const xiOffset = xi << 8 - zi;
            const size = files[z + zi]?.[(x << zi) + xi]?.[(y << zi) + yi];
            const cr = size === '0' ? 0xff : 0;
            const [cg, cb] = size && size !== '0' ? color : [0, 0];
            if (cr || cg || cb) {
              for (let row = 0; row < 1 << 8 - zi; row++) {
                for (let col = 0; col < 1 << 8 - zi; col++) {
                  const pos = ((yiOffset + row) * 256 + (xiOffset + col)) * 3;
                  tile[pos] = cr;
                  tile[pos + 1] = cg;
                  tile[pos + 2] = cb;
                }
              }
            }
          }
        }
      }
      const { filename, path } = xyz2filename(x, y, z);
      queue.enqueue(async () => {
        await mkdir(`${outdir}/${path}`, { recursive: true })
        .then(async () => {
          await sharp(tile, {
            raw: {
              channels: 3,
              height: 256,
              width: 256,
            },
          })
          .toFile(`${outdir}/${filename}`);
          console.log({ filename, path, x, y, z });
        });
      });
    }
  }
}
