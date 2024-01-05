import type { Layer } from '../../common/types/layer';
import type express from 'express';
import { StyQueue } from '@mc-styrsky/queue';
import { inspect } from 'util';
import { castObject } from '../../common/castObject';
import { modulo } from '../../common/math';
import { queues } from '../index';
import { getXYZ2Url } from '../utils/getXYZ2Url';
import { getMaxzoom, setMaxzoom } from '../utils/printStats';

interface TileParams { ttl: number, source: Layer; x: number; y: number; z: number; }

export const getTile = (
  req: express.Request<any, any, any, Record<string, any>, Record<string, any>>,
  res: express.Response,
) => {
  try {
    const { z } = castObject(req.params, {
      z: val => {
        const n = parseInt(String(val));
        if (Number.isNaN(n)) throw Error(`z ${inspect(val)} is NaN`);
        return n;
      },
    });
    if (z > getMaxzoom()) setMaxzoom(z);
    const parsePosition = (val: any) => {
      const n = parseInt(String(val), 16);
      if (Number.isNaN(n)) throw Error(`val ${inspect(val)} is NaN`);
      return modulo(parseInt(String(val), 16), 1 << z);
    };
    const { source, x, y } = castObject(req.params, {
      source: val => String(val) as Layer,
      x: parsePosition,
      y: parsePosition,
    });
    const { ttl } = castObject(req.query, {
      ttl: val => {
        const n = parseInt(String(val));
        return Number.isNaN(n) ? 0 : n;
      },
    });

    void fetchTile({ source, ttl, x, y, z }, res)
    .catch(e => {
      console.error(e);
      if (!res.headersSent) res.sendStatus(500);
    });
  }
  catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

async function fetchTile (
  { source, ttl, x, y, z }: TileParams,
  res: express.Response | null = null,
) {
  const queue = res ? queues.verbose : queues.quiet;
  await queue.enqueue(async () => {
    try {
      return await getXYZ2Url({ provider: source, x, y, z }).sendTile(res);
    }
    catch (e) {
      console.log(e);
      return false;
    }
  })
  .then(childs => {
    if (res) console.log('tile', { provider: source, x, y, z });
    queues.checked++;
    if (childs && ttl > 0 && z < 16) void fetchChilds({ source, ttl, x, y, z });
  });
}

async function fetchChildTile ({ dx, dy, source: provider, ttl, x, y, z }: { dx: number; dy: number} & TileParams) {
  await fetchTile({
    source: provider,
    ttl: ttl - 1,
    x: x * 2 + dx,
    y: y * 2 + dy,
    z: z + 1,
  })
  .catch(e => console.log(e));
}

async function fetchChilds ({ source: provider, ttl, x, y, z }: TileParams) {
  queues.childsCollapsed[z] ??= 0;
  queues.childs[z] ??= new StyQueue(1000);
  const queue = queues.childs[z];
  queues.childsCollapsed[z]++;
  while (queue.length > 100) await (queues.childs[z - 1] ??= new StyQueue(1000)).enqueue(() => new Promise(r => setTimeout(r, queue.length / 1)));
  queues.childsCollapsed[z]--;
  void queue.enqueue(() => fetchChildTile({ dx: 0, dy: 0, source: provider, ttl, x, y, z: z }));
  void queue.enqueue(() => fetchChildTile({ dx: 0, dy: 1, source: provider, ttl, x, y, z: z }));
  void queue.enqueue(() => fetchChildTile({ dx: 1, dy: 0, source: provider, ttl, x, y, z: z }));
  void queue.enqueue(() => fetchChildTile({ dx: 1, dy: 1, source: provider, ttl, x, y, z: z }));
}
