import type express from 'express';
import { extractProperties } from '../../common/extractProperties';

export const getNavionicsObjectinfo = async (
  req: express.Request<{
    itemId: string;
  }, any, any, Record<string, any>, Record<string, any>>,
  res: express.Response | null,
) => {
  const { itemId } = extractProperties(req.params, {
    itemId: String,
  });
  try {
    await fetch(`https://webapp.navionics.com/api/v2/objectinfo/marine/${itemId}?su=kmph&du=kilometers&dpu=meters&ugc=true&scl=false&z=11&sd=20&lang=de&_=1701878860274`)
    .then(
      async r => {
        if (r.ok) {
          const contentType = r.headers?.get('content-type');
          if (contentType)res?.contentType(contentType);
          res?.send(Buffer.from(await r.arrayBuffer()));
        }
        else res?.sendStatus(r.status);
      },
      () => {
        res?.sendStatus(500);
      },
    );
  }
  catch (e) {
    console.error(e);
    res?.status(500).send('internal server error');
    return;
  }
};
