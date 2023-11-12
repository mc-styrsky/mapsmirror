import { StyQueue } from '@mc-styrsky/queue';
import express from 'express';
import { port } from '../common/consts';
import { getTile } from './requestHandler/getTile';

export const pwd = '/home/sty/Documents/GitHub/mapsmirror';

export const queues = {
  childs: <Record<string, StyQueue>> {},
  fetch: new StyQueue(10),
  quiet: new StyQueue(100),
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
  const partialSum = (n: number) => (1 - Math.pow(4, n)) / (1 - 4);
  console.log({
    fetch: queues.fetch.length,
    maxzoom,
    quiet: queues.quiet.length,
    todo: Object.entries(queues.childs).reduce(
      (sum, [key, queue]) => {
        const len = queue.length;
        sum += Math.round(Math.max(0, len - 1000) * partialSum(16 - parseInt(key)));
        sum += Math.round(Math.min(1000, len) * partialSum(15 - parseInt(key)));
        return sum;
      }, 0),
    verbose: queues.verbose.length,
    ...Object.fromEntries(
      Object.entries(queues.childs)

      .map(([key, queue]) => [key, queue.length])
      .filter(([, v]) => v),
    ),
  });
  maxzoom = -1;
}, 2000);
