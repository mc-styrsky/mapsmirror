import type express from 'express';
import { createWriteStream } from 'fs';
import { mkdir, stat } from 'fs/promises';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import { extractProperties } from '../../common/extractProperties';
import { getMaxzoom, pwd, queues, setMaxzoom } from '../index';
import { xyz2default } from '../urls/default';
import { xyz2gebco } from '../urls/gebco';
import { xyz2googlehybrid } from '../urls/googlehybrid';
import { xyz2googlesat } from '../urls/googlesat';
import { xyz2googlestreet } from '../urls/googlestreet';
import { xyz2navionics } from '../urls/navionics';
import { xyz2osm } from '../urls/osm';
import { getTileParams } from '../utils/getTileParams';
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
    const ret = await queue.enqueue(async () => {
      let fetchChilds: boolean | null = null;

      const { params = {}, url = '' } = await ({
        gebco: xyz2gebco,
        googlehybrid: xyz2googlehybrid,
        googlesat: xyz2googlesat,
        googlestreet: xyz2googlestreet,
        navionics: xyz2navionics,
        osm: xyz2osm,
      }[provider] ?? xyz2default)(x, y, zoom);

      if (!url) {
        fetchChilds = false;
        res?.sendStatus(404);
        return fetchChilds;
      }

      const { tileFileId, tileId, tilePath } = getTileParams({ x, y, z: zoom });

      if (!(await Promise.all([
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
        fetchChilds = false;
        // console.log('unworthy', { provider, x, y, zoom });
        return fetchChilds;
      }

      const file = `${tileFileId}.png`;
      const path = `tiles/${provider}/${zoom.toString(36)}/${tilePath}`;
      await mkdir(path, { recursive: true });
      const filename = `${pwd}/${path}/${file}`;

      const fileStats = await stat(filename).catch(() => null);
      if (fileStats && fileStats.isFile()) {
        if (fileStats.size > 100) {
          if (!quiet) console.log('[cached]', filename);
          fetchChilds = true;
          res?.sendFile(filename);
        }
        else {
          fetchChilds = false;
          res?.sendStatus(404);
        }
      }
      else {
        const timeoutController = new globalThis.AbortController();
        const timeoutTimeout = setTimeout(() => timeoutController.abort(), 10000);

        // console.log('[get]   ', { x: (x / max).toFixed(4), y: (y / max).toFixed(4), z: zoom }, url);
        try {
          params.signal = timeoutController.signal;
          const imageStream = await fetch(url, params)
          .then((response) => {
            if (response.status === 200) return {
              body: response.body,
              status: response.status,
            };
            if (response.status === 404) return {
              body: Readable.from(''),
              status: response.status,
            };
            return {
              body: null,
              status: response.status,
            };
          })
          .catch(() => {
            res?.status(500).json({
              provider,
              tileId,
              url,
            });
            return {
              body: null,
              status: 500,
            };
          });

          if (imageStream.body) {
            fetchChilds = true;
            const writeImageStream = createWriteStream(filename);
            writeImageStream.addListener('finish', () => {
              if (quiet) res?.sendStatus(200);
              else res?.sendFile(filename);
            });
            imageStream.body.pipe(writeImageStream);
          }
          else {
            console.log('no imagestream', { x: (x / max).toFixed(4), y: (y / max).toFixed(4), z: zoom }, url);
            if (imageStream.status === 404) res?.sendStatus(imageStream.status);
          }
        }
        catch (e) {
          console.log(e);
        }
        clearTimeout(timeoutTimeout);
      }
      if (fetchChilds && ttl > 0 && zoom < 22 && provider !== 'gebco') {
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

        fetchTile(0, 0);
        fetchTile(0, 1);
        fetchTile(1, 0);
        fetchTile(1, 1);
      }
      return fetchChilds;
    });
    return ret;
  }
  catch (e) {
    console.error(e);
    res?.status(500).send('internal server error');
    return null;
  }
};
