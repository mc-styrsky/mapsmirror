import type { XYZ } from '../../common/types/xyz';
import type express from 'express';
import type { RequestInit } from 'node-fetch';
import { createWriteStream } from 'fs';
import { mkdir, stat, unlink } from 'fs/promises';
import fetch from 'node-fetch';
import { pwd, queues } from '../index';
import { getTileParams } from '../utils/getTileParams';
import { worthItMinMax } from '../utils/worthit';

export class XYZ2Url {
  constructor ({ provider, quiet, x, y, z }: XYZ & {
    quiet: any
    provider: string
  }) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.provider = provider;
    this.quiet = Boolean(quiet);
    this.verbose = !this.quiet;
    this.fallback = null;
  }
  readonly provider: string;
  readonly quiet: boolean;
  readonly verbose: boolean;
  fallback: null | typeof XYZ2Url;
  local: boolean = false;
  params: PromiseLike<RequestInit> | RequestInit = {};
  url: PromiseLike<string> | string = '';
  worthIt = async ({ x, y, z }) => {
    const res = await worthItMinMax({ x, y, z });
    if (!res) return false;
    const { max, min } = res;
    if (z <= 6) return min < 132;
    if (z <= 10) return max > 1 && min < 132;
    return max > 96 && min < 144 && (max < 132 || max - min > 3);
  };
  worthItArea = async ({ x, y, z }) => {
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
    body: NodeJS.ReadableStream | null
    status: number;
  }> => {
    const { url, x, y, z } = this;
    return fetch(await url, await this.params)
    .then(async (response) => {
      queues.fetched++;
      if (response.status === 200) return {
        body: response.body,
        status: response.status,
      };
      if (response.status === 404) {
        if (this.fallback) {
          const fallbackProvider = this.fallback.name.substring(7).toLowerCase();
          const fallback = new this.fallback({
            provider: fallbackProvider,
            quiet: this.quiet,
            x,
            y,
            z,
          });
          console.log('fallback to', fallbackProvider, await fallback.url);
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
      if (this.verbose) console.log('[cached]', filename);
      res?.sendFile(filename);
      return true;
    }
    if (this.local) {
      res?.sendStatus(404);
      return false;
    }
    const worthitStart = performance.now();
    if (this.verbose || await this.worthItArea({ x: x, y: y, z })) {
      const imageStream = await queues.fetch.enqueue(async () => {
        const timeoutController = new globalThis.AbortController();
        const timeoutTimeout = setTimeout(() => timeoutController.abort(), 10000);
        params.signal = timeoutController.signal;
        const ret = await this.fetchFromTileServer();
        clearTimeout(timeoutTimeout);
        return ret;
      });

      if (imageStream.body) {
        const writeImageStream = createWriteStream(filename);
        writeImageStream.addListener('finish', () => {
          if (this.quiet) res?.sendStatus(200);
          else res?.sendFile(filename);
        });
        imageStream.body.pipe(writeImageStream);
        return true;
      }

      console.log('no imagestream', imageStream.status, { x: (x / max).toFixed(4), y: (y / max).toFixed(4), z }, url);
      res?.sendStatus(imageStream.status ?? 500);
      return false;
    }
    queues.worthit += performance.now() - worthitStart;
    queues.worthitCount++;

    res?.sendFile(`${pwd}/unworthy.png`);
    return false;
  };
}
