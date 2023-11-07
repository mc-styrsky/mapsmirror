import { StyQueue } from '@mc-styrsky/queue';
import express from 'express';
import { createWriteStream } from 'fs';
import { mkdir, stat, unlink } from 'fs/promises';
import fetch from 'node-fetch';
import { extractProperties } from '../common/extractProperties';
import { xyz2default } from './urls/default';
import { xyz2gebco } from './urls/gebco';
import { xyz2googlehybrid } from './urls/googlehybrid';
import { xyz2googlesat } from './urls/googlesat';
import { xyz2googlestreet } from './urls/googlestreet';
import { xyz2navionics } from './urls/navionics';
import { xyz2osm } from './urls/osm';

const pwd = '/home/sty/Documents/GitHub/mapsmirror';
const port = 3000;

const queues = {
  quiet: new StyQueue(5),
  verbose: new StyQueue(10),
};

express()
.use(express.json())
.use(express.urlencoded({ extended: true }))
.use('', express.static('public'))
.get('/tile/:provider/:zoom/:x/:y', async (req, res) => {
  try {
    const { zoom } = extractProperties(req.params, {
      zoom: val => parseInt(String(val)),
    });
    const max = 1 << zoom;
    const parsePosition = (val: any) => {
      const ret = parseInt(String(val), 16) % max;
      return ret < 0 ? ret + max : ret;
    };
    const { provider, x, y } = extractProperties(req.params, {
      provider: String,
      x: parsePosition,
      y: parsePosition,
    });
    const { quiet, ttl } = extractProperties(req.query, {
      quiet: val => Boolean(parseInt(String(val ?? 0))),
      ttl: val => parseInt(String(val ?? 3)),
    });

    let fetchChilds = false;

    const { params = {}, url = '' } = await ({
      gebco: xyz2gebco,
      googlehybrid: xyz2googlehybrid,
      googlesat: xyz2googlesat,
      googlestreet: xyz2googlestreet,
      navionics: xyz2navionics,
      osm: xyz2osm,
    }[provider] ?? xyz2default)(x, y, zoom);
    const length = 1 + (zoom >> 2);
    const pathX = x.toString(16).padStart(length, '0').split('');
    const pathY = y.toString(16).padStart(length, '0').split('');


    const file = `${pathX.pop()}${pathY.pop()}.png`;
    const path = `tiles/${provider}/${zoom.toString(36)}/${pathX.map((_val, idx) => pathX[idx] + pathY[idx]).join('/')}`;
    await mkdir(path, { recursive: true });
    const filename = `${pwd}/${path}/${file}`;

    const fileStats = await stat(filename).catch(() => null);
    if (fileStats && fileStats.isFile() && fileStats.size > 100) {
      if (!quiet) console.log('[cached]', filename);
      fetchChilds = true;
      res.sendFile(filename);
    }
    else {
      if (fileStats && fileStats.size > 0) {
        console.log('[unlink]', filename);
        await unlink(filename);
      }
      const queue = quiet ? queues.quiet : queues.verbose;
      await queue.enqueue(async () => {
        const timeoutController = new globalThis.AbortController();
        const timeoutTimeout = setTimeout(() => timeoutController.abort(), 10000);

        console.log('[get]   ', filename);
        try {
          params.signal = timeoutController.signal;
          const imageStream = await fetch(url, params)
          .then((response) => {
            if (response.status === 200) return response.body;
            return null;
          })
          .catch(() => {
            res.status(500).json({
              length,
              pathX,
              pathY,
              provider,
              url,
            });
          });

          if (imageStream) {
            fetchChilds = true;
            const writeImageStream = createWriteStream(filename);
            writeImageStream.addListener('finish', () => {
              if (quiet) {
                console.log('[precached]', queue.length, url);
                res.sendStatus(200);
              }
              else {
                console.log('[send]  ', filename);
                res.sendFile(filename);
              }
            });
            imageStream.pipe(writeImageStream);
          }
        }
        catch { /* empty */ }
        clearTimeout(timeoutTimeout);
      });
    }
    if (fetchChilds && ttl > 0 && zoom < 17) {
      const fetchTile = async (dx: number, dy: number) => {
        const url = `http://localhost:${port}/tile/${provider}/${zoom + 1}/${x * 2 + dx}/${y * 2 + dy}?ttl=${ttl - 1}&quiet=1`;
        try {
          return await fetch(url);
        }
        catch { /* empty */ }
        return console.log('[failed]', url);
      };
      Promise.all([
        fetchTile(0, 0),
        fetchTile(0, 1),
        fetchTile(1, 0),
        fetchTile(1, 1),
      ]);
    }
  }
  catch (e) {
    console.error(e);
    res.status(500).send('internal server error');
  }
})
.listen(port, () => console.log(`backend listener running on port ${port}`))
.on('error', (e) => {
  console.error(`cannot start listener on port ${port}`);
  console.log(e);
});
