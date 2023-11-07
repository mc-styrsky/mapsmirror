import { mkdir } from 'fs/promises';
import { fromFile } from 'geotiff';
import sharp from 'sharp';

const zoom = 17; // max 17, gebco's resolution is 16.4
const zoom1 = zoom - 1;
const zoom2 = zoom - 2;
const mapLength = Math.max(
  2 * 512 * 512,
  4 * (1 << zoom - 8) * (1 << zoom - 8),
);
const mapLength1 = mapLength - 1;
const mapCount = Math.ceil((1 << zoom) * (1 << zoom) / mapLength);
const depthMaps = Array(mapCount).fill(null).map(() => new Uint8Array(mapLength));
console.log(depthMaps.map(map => map.length));
const transform = {
  latnorth: new Array(1 << zoom1).fill(0).map((_val, idx) => 21599 - (Math.asin(Math.tanh(((1 << zoom1) - idx) * Math.PI / (1 << zoom1))) / Math.PI * 21600 * 2 | 0)),
  latsouth: new Array(1 << zoom1).fill(0).map((_val, idx) => Math.asin(Math.tanh(idx * Math.PI / (1 << zoom1))) / Math.PI * 21600 * 2 | 0),
  lon: new Array(1 << zoom2).fill(0).map((_val, idx) => idx * 21600 >> zoom2),
};
console.log(transform);

const files = [
  {
    file: 'gebco_2023_n90.0_s0.0_w-180.0_e-90.0.tif',
    offset: { x: 0 << zoom2, y: 0 },
  },
  {
    file: 'gebco_2023_n0.0_s-90.0_w-180.0_e-90.0.tif',
    offset: { x: 0 << zoom2, y: 1 << zoom1 },
  },
  {
    file: 'gebco_2023_n90.0_s0.0_w-90.0_e0.0.tif',
    offset: { x: 1 << zoom2, y: 0 },
  },
  {
    file: 'gebco_2023_n0.0_s-90.0_w-90.0_e0.0.tif',
    offset: { x: 1 << zoom2, y: 1 << zoom1 },
  },
  {
    file: 'gebco_2023_n90.0_s0.0_w0.0_e90.0.tif',
    offset: { x: 2 << zoom2, y: 0 },
  },
  {
    file: 'gebco_2023_n0.0_s-90.0_w0.0_e90.0.tif',
    offset: { x: 2 << zoom2, y: 1 << zoom1 },
  },
  {
    file: 'gebco_2023_n90.0_s0.0_w90.0_e180.0.tif',
    offset: { x: 3 << zoom2, y: 0 },
  },
  {
    file: 'gebco_2023_n0.0_s-90.0_w90.0_e180.0.tif',
    offset: { x: 3 << zoom2, y: 1 << zoom1 },
  },
];
await files.reduce(async (prom, { file, offset: { x, y } }) => {
  await prom;

  console.log(`open ${file}`);
  console.time(`open ${file}`);
  const tiff = await fromFile(`sources/${file}`);
  const image = await tiff.getImage();
  console.timeEnd(`open ${file}`);

  console.log(`get rasters from ${file}`);
  console.time(`get rasters from ${file}`);
  const { [0]: raster } = await image.readRasters();
  console.timeEnd(`get rasters from ${file}`);
  console.log(`transform ${file}`);
  console.time(`transform ${file}`);
  (y ? transform.latsouth : transform.latnorth).forEach((gebcoy, dy, lat) => {
    const ydy = y + dy;
    const lineOffset = gebcoy * 21600;
    transform.lon.forEach((gebcox, dx, lon) => {
      const xdx = x + dx;
      const valueRaw = raster[lineOffset + gebcox];
      if (typeof valueRaw !== 'number') console.log({ dx, dy, gebcox, gebcoy, lat, lineOffset, lon, value: valueRaw, x, y });
      const val = Math.max(0, Math.min(Math.round(valueRaw) + 255, 255));
      if (!(val <= 255 && val >= 0)) console.log(val);
      const pos = xdx + ydy * (1 << zoom);
      depthMaps[pos / mapLength | 0][pos & mapLength1] = val;
    });
  });
  console.timeEnd(`transform ${file}`);
  return prom;
}, Promise.resolve(null));


async function writeTiles (maps, z) {
  if (z < 8) return;

  for (let x = 0; x < 1 << z - 8; x++) {
    console.log('files', { x, z });
    for (let y = 0; y < 1 << z - 8; y++) {
      const tile = new Uint8Array(1 << 16);
      for (let dy = 0; dy < 256; dy++) {
        const offsettotal = ((y << 8) + dy) * (1 << z) + (x << 8);
        const mapid = offsettotal / mapLength | 0;
        const offset = offsettotal - mapLength * mapid;
        const map = maps[mapid];
        const inneroffset = dy << 8;
        for (let dx = 0; dx < 256; dx++) {
          const val = map[offset + dx];
          if (!(val <= 255 && val >= 0)) console.log(val);
          tile[inneroffset + dx] = val;
        }
      }

      const length = 1 + (z - 8 >> 2);
      const pathX = x.toString(16).padStart(length, '0').split('');
      const pathY = y.toString(16).padStart(length, '0').split('');
      const file = `${pathX.pop()}${pathY.pop()}.png`;
      const path = `/home/sty/Documents/GitHub/mapsmirror/tiles/gebco/${(z - 8).toString(36)}/${pathX.map((_val, idx) => pathX[idx] + pathY[idx]).join('/')}`;
      const filename = `${path}/${file}`;
      mkdir(path, { recursive: true })
      .then(() => sharp(tile, {
        raw: {
          channels: 1,
          height: 256,
          width: 256,
        },
      })
      .toFile(filename));
    }
  }

  if (z > 8) {
    const nextMapCount = Math.ceil((1 << z - 1) * (1 << z - 1) / mapLength);
    const nextMaps = Array(nextMapCount).fill(null).map(() => new Uint8Array(mapLength));

    const w = 1 << z;
    for (let y = 0; y < w; y += 2) {
      const offsettotal = y * w;
      const mapid = offsettotal / mapLength | 0;
      const offset = offsettotal - mapLength * mapid;
      const map = maps[mapid];
      for (let x = 0; x < w; x += 2) {
        const val = Math.max(
          map[offset + x],
          map[offset + x + 1],
          map[offset + w + x],
          map[offset + w + x + 1],
        );
        const pos = offsettotal / 4 + (x >> 1);
        nextMaps[pos / mapLength | 0][pos & mapLength1] = val;
      }
    }
    await writeTiles(nextMaps, z - 1);
  }
}

await writeTiles(depthMaps, zoom);
