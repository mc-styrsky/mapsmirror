import type express from 'express';
import { extractProperties } from '../../common/extractProperties';

export const getNavionicsIcon = async (
  req: express.Request<{
    iconId: string;
  }, any, any, Record<string, any>, Record<string, any>>,
  res: express.Response | null,
) => {
  const { iconId } = extractProperties(req.params, {
    iconId: String,
  });
  try {
    await fetch(`https://webapp.navionics.com/api/v2/assets/images/${iconId}`)
    .then(
      async r => {
        if (r.ok) {
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
