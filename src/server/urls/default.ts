import type { Layer } from '../../common/types/layer';
import type { XYZ } from '../../common/types/xyz';
import type express from 'express';
import { mkdir, stat, unlink, writeFile } from 'fs/promises';
import { pwd, queues } from '../index';
import { getTileParams } from '../utils/getTileParams';
import { getXYZ2Url } from '../utils/getXYZ2Url';
import { worthItMinMax } from '../utils/worthit';

export class XYZ2Url {
  constructor ({ provider, x, y, z }: XYZ & {
    provider: Layer
  }) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.provider = provider;
    this.fallback = null;
  }
  readonly provider: Layer;
  fallback: null | Layer;
  local = false;
  params: PromiseLike<RequestInit> | RequestInit = {};
  url: PromiseLike<string> | string = '';
  worthIt = async ({ x, y, z }: XYZ) => {
    const res = await worthItMinMax({ x, y, z });
    if (!res) return false;
    const { max, min } = res;
    if (z <= 6) return min < 132;
    if (z <= 10) return max > 1 && min < 132;
    return max > 96 && min < 144 && (max < 132 || max - min > 3);
  };
  worthItArea = async ({ x, y, z }: XYZ) => {
    return (await Promise.all([
      this.worthIt({ x: x, y: y, z }),
      this.worthIt({ x: x, y: y - 1, z }),
      this.worthIt({ x: x, y: y + 1, z }),
      this.worthIt({ x: x - 1, y: y, z }),
      this.worthIt({ x: x - 1, y: y - 1, z }),
      this.worthIt({ x: x - 1, y: y + 1, z }),
      this.worthIt({ x: x + 1, y: y, z }),
      this.worthIt({ x: x + 1, y: y - 1, z }),
      this.worthIt({ x: x + 1, y: y + 1, z }),
    ])).some(Boolean);
  };
  readonly x: number;
  readonly y: number;
  readonly z: number;

  fetchFromTileServer = async (): Promise<{
    body: ArrayBuffer | null
    status: number;
  }> => {
    const { url, x, y, z } = this;
    return fetch(await url, await this.params)
    .then(async (response) => {
      queues.fetched++;
      if (response.status === 200) return {
        body: await response.arrayBuffer(),
        status: response.status,
      };
      if (response.status === 404) {
        if (this.fallback) {
          const fallback = getXYZ2Url({
            provider: this.fallback,
            x,
            y,
            z,
          });
          console.log('fallback to', this.fallback, await fallback.url);
          return fallback.fetchFromTileServer();
        }
        return {
          body: null,
          status: response.status,
        };
      }
      console.log(response.status, response.statusText, url);
      return {
        body: null,
        status: response.status,
      };
    })
    .catch(() => {
      return {
        body: null,
        status: 500,
      };
    });
  };


  sendTile = async (res: express.Response | null,
  ): Promise<boolean> => {
    const url = await this.url;
    const params = await this.params;
    const { x, y, z } = this;
    const max = 1 << z;

    if (!url) {
      res?.sendStatus(404);
      return false;
    }

    const { tileFileId, tilePath } = getTileParams({ x, y, z });

    const file = `${tileFileId}.png`;
    const path = `tiles/${this.provider}/${z.toString(36)}/${tilePath}`;
    await mkdir(path, { recursive: true });
    const filename = `${pwd}/${path}/${file}`;

    const statsStart = performance.now();
    const fileStats = await stat(filename)
    .then(async (stats) => {
      if (!stats.isFile()) return null;
      if (this.provider === 'googlesat' && stats.size < 100) {
        await unlink(filename);
        return null;
      }
      return stats;
    })
    .catch(() => null);
    queues.stats = performance.now() - statsStart;
    queues.statsCount++;

    if (fileStats) {
      // if (this.verbose) console.log('[cached]', filename);
      res?.sendFile(filename);
      return true;
    }
    if (this.local) {
      res?.sendStatus(404);
      return false;
    }
    const worthitStart = performance.now();
    if (res ?? await this.worthItArea({ x: x, y: y, z })) {
      const imageStream = await queues.fetch.enqueue(async () => {
        const timeoutController = new globalThis.AbortController();
        const timeoutTimeout = setTimeout(() => timeoutController.abort(), 10000);
        params.signal = timeoutController.signal;
        const ret = await this.fetchFromTileServer();
        clearTimeout(timeoutTimeout);
        return ret;
      });

      if (imageStream.body) {
        if (res) console.log('[fetched]', filename);
        res?.send(Buffer.from(imageStream.body));
        await writeFile(filename, Buffer.from(imageStream.body));
        return true;
      }

      console.log('no imagestream', imageStream.status, { x: (x / max).toFixed(4), y: (y / max).toFixed(4), z }, url);
      res?.sendStatus(imageStream.status ?? 500);
      return false;
    }
    queues.worthit += performance.now() - worthitStart;
    queues.worthitCount++;

    return false;
  };
}
