import { StyQueue } from '@mc-styrsky/queue';
import express from 'express';
import { port } from '../common/consts';
import { getTile } from './requestHandler/getTile';

export const pwd = '/home/sty/Documents/GitHub/mapsmirror';

export const queues = {
  quiet: new StyQueue(10),
  verbose: new StyQueue(10),
};

express()
.use(express.json())
.use(express.urlencoded({ extended: true }))
.use('', express.static('public'))
.get('/tile/:provider/:zoom/:x/:y', getTile)
.listen(port, () => console.log(`backend listener running on port ${port}`))
.on('error', (e) => {
  console.error(`cannot start listener on port ${port}`);
  console.log(e);
});

let maxzoom = -1;

export const getMaxzoom = () => maxzoom;
export const setMaxzoom = (z: number) => maxzoom = z;

setInterval(() => {
  console.log({
    maxzoom,
    quite: queues.quiet.length,
    verbose: queues.verbose.length,
  });
}, 2000);
