import type express from 'express';
import { castObject } from '../../common/extractProperties';
import { navionicsQueue } from '../utils/navionicsQueue';

const objectinfoCache = new Map<string, Record<string, any>>();
export const getNavionicsObjectinfo = (
  req: express.Request<{
    itemId: string;
  }, any, any, Record<string, any>, Record<string, any>>,
  res: express.Response,
) => {
  void navionicsQueue.enqueue(() => {
    try {
      const { itemId } = castObject(req.params, {
        itemId: String,
      });
      const fromCache = objectinfoCache.get(itemId);
      if (fromCache) {
        console.log('[cached]', itemId);
        res.json(fromCache);
      }
      else {
        console.log('[fetch] ', itemId);
        fetch(`https://webapp.navionics.com/api/v2/objectinfo/marine/${itemId}`)
        .then(
          async r => {
            if (r.ok) {
              const toCache = await r.json() as Record<string, any>;
              objectinfoCache.set(itemId, toCache) as Record<string, any>;
              res.json(toCache);
            }
            else res.sendStatus(r.status);
          },
          () => {
            res.sendStatus(500);
          },
        );
      }
    }
    catch (e) {
      console.error(e);
      res.status(500).send('internal server error');
      return;
    }
  });
};
