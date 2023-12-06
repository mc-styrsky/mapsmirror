import type express from 'express';
import { StyQueue } from '@mc-styrsky/queue';
import { createWriteStream } from 'fs';
import { mkdir, stat, unlink } from 'fs/promises';
import { extractProperties } from '../../common/extractProperties';
import { modulo } from '../../common/modulo';
import { pwd, queues } from '../index';
import { xyz2bingsat } from '../urls/bingsat';
import { xyz2bluemarble } from '../urls/bluemarble';
import { xyz2cache } from '../urls/cache';
import { xyz2default } from '../urls/default';
import { xyz2gebco } from '../urls/gebco';
import { xyz2googlehybrid } from '../urls/googlehybrid';
import { xyz2googlesat } from '../urls/googlesat';
import { xyz2googlestreet } from '../urls/googlestreet';
import { xyz2navionics } from '../urls/navionics';
import { xyz2openseamap } from '../urls/openseamap';
import { xyz2opentopomap } from '../urls/opentopomap';
import { xyz2osm } from '../urls/osm';
import { xyz2vfdensity } from '../urls/vfdensity';
import { fetchFromTileServer } from '../utils/fetchFromTileServer';
import { getTileParams } from '../utils/getTileParams';
import { getMaxzoom, setMaxzoom } from '../utils/printStats';
import { worthItMinMax } from '../utils/worthit';

export const getTile = async (
  req: express.Request<{
    provider: string;
    zoom: string;
    x: string;
    y: string;
  }, any, any, Record<string, any>, Record<string, any>>,
  res: express.Response | null,
): Promise<boolean | null> => {
  try {
    const { zoom } = extractProperties(req.params, {
      zoom: val => parseInt(String(val)),
    });
    if (zoom > getMaxzoom()) setMaxzoom(zoom);
    const max = 1 << zoom;
    const parsePosition = (val: any) => {
      return modulo(parseInt(String(val), 16), max);
    };
    const { provider, x, y } = extractProperties(req.params, {
      provider: String,
      x: parsePosition,
      y: parsePosition,
    });
    const { quiet, ttl } = extractProperties(req.query, {
      quiet: val => Boolean(parseInt(String(val ?? 0))),
      ttl: val => parseInt(String(val ?? 3)),
    });

    const queue = quiet ? queues.quiet : queues.verbose;
    const fetchChilds = await queue.enqueue(async () => {
      try {
        const {
          local = false,
          params = {},
          url = '',
          worthIt = async ({ x, y, z }) => {
            const res = await worthItMinMax({ x, y, z });
            if (!res) return false;
            const { max, min } = res;
            if (z <= 6) return min < 132;
            if (z <= 10) return max > 1 && min < 132;
            return max > 96 && min < 144 && (max < 132 || max - min > 3);
          },
        } = await ({
          bingsat: xyz2bingsat,
          bluemarble: xyz2bluemarble,
          cache: xyz2cache,
          gebco: xyz2gebco,
          googlehybrid: xyz2googlehybrid,
          googlesat: xyz2googlesat,
          googlestreet: xyz2googlestreet,
          navionics: xyz2navionics,
          openseamap: xyz2openseamap,
          opentopomap: xyz2opentopomap,
          osm: xyz2osm,
          vfdensity: xyz2vfdensity,
        }[provider] ?? xyz2default)(x, y, zoom);

        if (!url) {
          res?.sendStatus(404);
          return false;
        }

        const { tileFileId, tilePath } = getTileParams({ x, y, z: zoom });

        const file = `${tileFileId}.png`;
        const path = `tiles/${provider}/${zoom.toString(36)}/${tilePath}`;
        await mkdir(path, { recursive: true });
        const filename = `${pwd}/${path}/${file}`;

        const statsStart = performance.now();
        const fileStats = await stat(filename)
        .then(async (stats) => {
          if (!stats.isFile()) return null;
          if (provider === 'googlesat' && stats.size < 100) {
            await unlink(filename);
            return null;
          }
          return stats;
        })
        .catch(() => null);
        queues.stats = performance.now() - statsStart;
        queues.statsCount++;

        if (fileStats) {
          if (!quiet) console.log('[cached]', filename);
          res?.sendFile(filename);
          return true;
        }
        if (local) {
          res?.sendStatus(404);
          return false;
        }
        const worthitStart = performance.now();
        if (!quiet || (await Promise.all([
          worthIt({ x: x, y: y, z: zoom }),
          worthIt({ x: x, y: y - 1, z: zoom }),
          worthIt({ x: x, y: y + 1, z: zoom }),
          worthIt({ x: x - 1, y: y, z: zoom }),
          worthIt({ x: x - 1, y: y - 1, z: zoom }),
          worthIt({ x: x - 1, y: y + 1, z: zoom }),
          worthIt({ x: x + 1, y: y, z: zoom }),
          worthIt({ x: x + 1, y: y - 1, z: zoom }),
          worthIt({ x: x + 1, y: y + 1, z: zoom }),
        ])).some(Boolean)) {
          const imageStream = await queues.fetch.enqueue(async () => {
            const timeoutController = new globalThis.AbortController();
            const timeoutTimeout = setTimeout(() => timeoutController.abort(), 10000);
            params.signal = timeoutController.signal;
            const ret = await fetchFromTileServer({ params, provider, url, x, y, z: zoom });
            clearTimeout(timeoutTimeout);
            return ret;
          });

          if (imageStream.body) {
            const writeImageStream = createWriteStream(filename);
            writeImageStream.addListener('finish', () => {
              if (quiet) res?.sendStatus(200);
              else res?.sendFile(filename);
            });
            imageStream.body.pipe(writeImageStream);
            return true;
          }

          console.log('no imagestream', imageStream.status, { x: (x / max).toFixed(4), y: (y / max).toFixed(4), z: zoom }, url);
          res?.sendStatus(imageStream.status ?? 500);
          return false;
        }
        queues.worthit += performance.now() - worthitStart;
        queues.worthitCount++;

        res?.sendFile(`${pwd}/unworthy.png`);
        // console.log('unworthy', { provider, x, y, zoom });
        return false;
      }
      catch (e) {
        console.log(e);
        return false;
      }
    });

    queues.checked++;

    if (fetchChilds && ttl > 0 && zoom < 16) pushToQueues({ provider, ttl, x, y, zoom });

    return fetchChilds;
  }
  catch (e) {
    console.error(e);
    res?.status(500).send('internal server error');
    return null;
  }
};

async function fetchTile ({ dx, dy, provider, ttl, x, y, zoom }: { dx: number; dy: number; provider: string; x: number; y: number; zoom: number; ttl: number }) {
  try {
    await getTile(
      <any>{
        params: {
          provider,
          x: (x * 2 + dx).toString(16),
          y: (y * 2 + dy).toString(16),
          zoom: String(zoom + 1),
        },
        query: {
          quiet: '1',
          ttl: String(ttl - 1),
        },
      },
      null,
    );
  }
  catch (e) {
    console.log(e);
  }
}
async function pushToQueues ({ provider, ttl, x, y, zoom }: { ttl: number, provider: string; x: number; y: number; zoom: number; }) {
  queues.childsCollapsed[zoom] ??= 0;
  queues.childs[zoom] ??= new StyQueue(1000);
  const childQueue = queues.childs[zoom];
  queues.childsCollapsed[zoom]++;
  while (childQueue.length > 100) await (queues.childs[zoom - 1] ??= new StyQueue(1000)).enqueue(() => new Promise(r => setTimeout(r, childQueue.length / 1)));
  queues.childsCollapsed[zoom]--;
  childQueue.enqueue(() => fetchTile({ dx: 0, dy: 0, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchTile({ dx: 0, dy: 1, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchTile({ dx: 1, dy: 0, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchTile({ dx: 1, dy: 1, provider, ttl, x, y, zoom }));
}
