import type express from 'express';
import { StyQueue } from '@mc-styrsky/queue';
import { createWriteStream } from 'fs';
import { mkdir, stat, unlink } from 'fs/promises';
import { extractProperties } from '../../common/extractProperties';
import { pwd, queues } from '../index';
import { xyz2cache } from '../urls/cache';
import { xyz2default } from '../urls/default';
import { xyz2gebco } from '../urls/gebco';
import { xyz2googlehybrid } from '../urls/googlehybrid';
import { xyz2googlesat } from '../urls/googlesat';
import { xyz2googlestreet } from '../urls/googlestreet';
import { xyz2navionics } from '../urls/navionics';
import { xyz2osm } from '../urls/osm';
import { fetchFromTileServer } from '../utils/fetchFromTileServer';
import { getTileParams } from '../utils/getTileParams';
import { getMaxzoom, setMaxzoom } from '../utils/printStats';
import { worthIt } from '../utils/worthit';

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
      const ret = parseInt(String(val), 16) % max;
      return ret < 0 ? ret + max : ret;
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
      let ret: boolean | null = null;

      const { local = false, params = {}, url = '' } = await ({
        cache: xyz2cache,
        gebco: xyz2gebco,
        googlehybrid: xyz2googlehybrid,
        googlesat: xyz2googlesat,
        googlestreet: xyz2googlestreet,
        navionics: xyz2navionics,
        osm: xyz2osm,
      }[provider] ?? xyz2default)(x, y, zoom);

      if (!url) {
        ret = false;
        res?.sendStatus(404);
        return ret;
      }

      const { tileFileId, tilePath } = getTileParams({ x, y, z: zoom });

      if (!(await Promise.all([
        local,
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
        res?.sendFile(`${pwd}/unworthy.png`);
        ret = false;
        // console.log('unworthy', { provider, x, y, zoom });
        return ret;
      }

      const file = `${tileFileId}.png`;
      const path = `tiles/${provider}/${zoom.toString(36)}/${tilePath}`;
      await mkdir(path, { recursive: true });
      const filename = `${pwd}/${path}/${file}`;

      const fileStats = await stat(filename).catch(() => null);
      if (fileStats && fileStats.isFile()) {
        if (fileStats.size > 100) {
          if (!quiet) console.log('[cached]', filename);
          ret = true;
          res?.sendFile(filename);
        }
        else {
          ret = false;
          if (provider === 'googlesat') {
            await unlink(filename);
            res?.redirect(`/tile/googlehybrid/${zoom}/${x.toString(16)}/${y.toString(16)}?ttl=${ttl}`);
          }
          else res?.sendStatus(404);
        }
      }
      else if (local) {
        ret = false;
        res?.sendStatus(404);
      }
      else {
        // console.log('[get]   ', { x: (x / max).toFixed(4), y: (y / max).toFixed(4), z: zoom }, url);
        try {
          const imageStream = await queues.fetch.enqueue(async () => {
            const timeoutController = new globalThis.AbortController();
            const timeoutTimeout = setTimeout(() => timeoutController.abort(), 10000);
            params.signal = timeoutController.signal;
            const ret = await fetchFromTileServer({ params, provider, url, x, y, z: zoom });
            clearTimeout(timeoutTimeout);
            return ret;
          });

          if (imageStream.body) {
            ret = true;
            const writeImageStream = createWriteStream(filename);
            writeImageStream.addListener('finish', () => {
              if (quiet) res?.sendStatus(200);
              else res?.sendFile(filename);
            });
            imageStream.body.pipe(writeImageStream);
          }
          else {
            console.log('no imagestream', imageStream.status, { x: (x / max).toFixed(4), y: (y / max).toFixed(4), z: zoom }, url);
            res?.sendStatus(imageStream.status ?? 500);
          }
        }
        catch (e) {
          console.log(e);
        }
      }
      return ret;
    });
    if (fetchChilds && ttl > 0 && zoom < 22) {
      const fetchTile = async (dx: number, dy: number) => {
        try {
          await getTile(
            <any> {
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
      };

      queues.childsCollapsed[zoom] ??= 0;
      queues.childs[zoom] ??= new StyQueue(1000);
      const childQueue = queues.childs[zoom];
      queues.childsCollapsed[zoom]++;
      await childQueue.enqueue(() => null);
      queues.childsCollapsed[zoom]--;
      childQueue.enqueue(() => fetchTile(0, 0));
      childQueue.enqueue(() => fetchTile(0, 1));
      childQueue.enqueue(() => fetchTile(1, 0));
      childQueue.enqueue(() => fetchTile(1, 1));
    }
    return fetchChilds;
  }
  catch (e) {
    console.error(e);
    res?.status(500).send('internal server error');
    return null;
  }
};
