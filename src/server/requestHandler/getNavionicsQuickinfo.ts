import type express from 'express';
import { extractProperties } from '../../common/extractProperties';
import { x2lonCommon } from '../../common/x2lon';
import { y2latCommon } from '../../common/y2lat';

const quickinfoCache: Map<string, any> = new Map();

export const getNavionicsQuickinfo = async (
  req: express.Request<{
    x: number,
    y: number,
    z: string
  }, any, any, Record<string, any>, Record<string, any>>,
  res: express.Response | null,
) => {
  const { x, y, z } = extractProperties(req.params, {
    x: Number,
    y: Number,
    z: Number,
  });
  try {
    const { lat, lon } = {
      lat: y2latCommon(y, 1 << z) * 180 / Math.PI,
      lon: x2lonCommon(x, 1 << z) * 180 / Math.PI,
    };
    const xyz = `${z}_${x}_${y}`;
    const fromCache = quickinfoCache.get(xyz);
    if (fromCache) {
      console.log('[cached]', xyz);
      res?.json(fromCache);
    }
    else {
      console.log('[fetch] ', xyz);

      await fetch(`https://webapp.navionics.com/api/v2/quickinfo/marine/${lat}/${lon}?z=${Math.max(2, Math.min(Number(z), 17))}&ugc=true&lang=en`)
      .then(
        async r => {
          if (r.ok) {
            const toCache = await r.json();
            quickinfoCache.set(xyz, toCache);
            res?.json(toCache);
          }
          else res?.sendStatus(r.status);
        },
        () => {
          res?.sendStatus(500);
        },
      );
    }
  }
  catch (e) {
    console.error(e);
    res?.status(500).send('internal server error');
    return;
  }
};
