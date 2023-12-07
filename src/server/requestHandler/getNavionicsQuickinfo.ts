import type express from 'express';
import { extractProperties } from '../../common/extractProperties';

export const getNavionicsQuickinfo = async (
  req: express.Request<{
    lat: string,
    lon: string,
  }, any, any, Record<string, any>, Record<string, any>>,
  res: express.Response | null,
) => {
  const { lat, lon } = extractProperties(req.params, {
    lat: String,
    lon: String,
  });
  try {
    await fetch(`https://webapp.navionics.com/api/v2/quickinfo/marine/${lat}/${lon}?su=kmph&du=kilometers&dpu=meters&ugc=true&scl=false&z=11&sd=20&lang=de&_=1701878860273`)
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
