import type express from 'express';
import { StyQueue } from '@mc-styrsky/queue';
import { castObject } from '../../common/extractProperties';
import { modulo } from '../../common/modulo';
import { queues } from '../index';
import { XYZ2UrlBingsat } from '../urls/bingsat';
import { XYZ2UrlCache } from '../urls/cache';
import { XYZ2Url } from '../urls/default';
import { XYZ2UrlGebco } from '../urls/gebco';
import { XYZ2UrlGooglehybrid } from '../urls/googlehybrid';
import { XYZ2UrlGooglesat } from '../urls/googlesat';
import { XYZ2UrlGooglestreet } from '../urls/googlestreet';
import { XYZ2UrlNavionics } from '../urls/navionics';
import { XYZ2UrlOpenseamap } from '../urls/openseamap';
import { XYZ2UrlOpentopomap } from '../urls/opentopomap';
import { XYZ2UrlOsm } from '../urls/osm';
import { XYZ2UrlVfdensity } from '../urls/vfdensity';
import { XYZ2UrlWorthit } from '../urls/worthit';
import { getMaxzoom, setMaxzoom } from '../utils/printStats';

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
    const { zoom } = castObject(req.params, {
      zoom: val => parseInt(String(val)),
    });
    if (zoom > getMaxzoom()) setMaxzoom(zoom);
    const parsePosition = (val: any) => {
      return modulo(parseInt(String(val), 16), 1 << zoom);
    };
    const { provider, x, y } = castObject(req.params, {
      provider: String,
      x: parsePosition,
      y: parsePosition,
    });
    const { quiet, ttl } = castObject(req.query, {
      quiet: val => Boolean(parseInt(String(val ?? 0))),
      ttl: val => parseInt(String(val ?? 3)),
    });

    const queue = quiet ? queues.quiet : queues.verbose;
    const fetchChilds = await queue.enqueue(() => {
      try {
        const xyz2url = new ({
          bingsat: XYZ2UrlBingsat,
          cache: XYZ2UrlCache,
          gebco: XYZ2UrlGebco,
          googlehybrid: XYZ2UrlGooglehybrid,
          googlesat: XYZ2UrlGooglesat,
          googlestreet: XYZ2UrlGooglestreet,
          navionics: XYZ2UrlNavionics,
          openseamap: XYZ2UrlOpenseamap,
          opentopomap: XYZ2UrlOpentopomap,
          osm: XYZ2UrlOsm,
          vfdensity: XYZ2UrlVfdensity,
          worthit: XYZ2UrlWorthit,
        }[provider] ?? XYZ2Url)({ provider, quiet, x, y, z: zoom });
        return xyz2url.sendTile(res);
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

async function fetchChildTile ({ dx, dy, provider, ttl, x, y, zoom }: { dx: number; dy: number; provider: string; x: number; y: number; zoom: number; ttl: number }) {
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
  childQueue.enqueue(() => fetchChildTile({ dx: 0, dy: 0, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchChildTile({ dx: 0, dy: 1, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchChildTile({ dx: 1, dy: 0, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchChildTile({ dx: 1, dy: 1, provider, ttl, x, y, zoom }));
}
