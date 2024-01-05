import type express from 'express';
import { castObject } from '../../common/castObject';

const iconCache = new Map<string, Buffer>();

export const getNavionicsIcon = (
  req: express.Request<{
    iconId: string;
  }, any, any, Record<string, any>, Record<string, any>>,
  res: express.Response | null,
) => {
  const { iconId } = castObject(req.params, {
    iconId: String,
  });
  try {
    const fromCache = iconCache.get(iconId);
    if (fromCache) {
      console.log('[cached]', iconId);
      res?.send(fromCache);
    }
    else {
      fetch(`https://webapp.navionics.com/api/v2/assets/images/${iconId}`)
      .then(
        async r => {
          if (r.ok) {
            const toCache = Buffer.from(await r.arrayBuffer());
            iconCache.set(iconId, toCache);
            res?.send(toCache);
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
