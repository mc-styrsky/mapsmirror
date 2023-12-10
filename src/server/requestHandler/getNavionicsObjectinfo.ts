import type express from 'express';
import { extractProperties } from '../../common/extractProperties';

const objectinfoCache: Map<string, any> = new Map();
export const getNavionicsObjectinfo = async (
  req: express.Request<{
    itemId: string;
  }, any, any, Record<string, any>, Record<string, any>>,
  res: express.Response | null,
) => {
  try {
    const { itemId } = extractProperties(req.params, {
      itemId: String,
    });
    const fromCache = objectinfoCache.get(itemId);
    if (fromCache) {
      console.log('[cached]', itemId);
      res?.json(fromCache);
    }
    else {
      console.log('[fetch] ', itemId);
      await fetch(`https://webapp.navionics.com/api/v2/objectinfo/marine/${itemId}`)
      .then(
        async r => {
          if (r.ok) {
            const toCache = await r.json();
            objectinfoCache.set(itemId, toCache);
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
