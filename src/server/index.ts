import { StyQueue } from '@mc-styrsky/queue';
import express from 'express';
import { port } from '../common/consts';
import { getTile } from './requestHandler/getTile';

export const pwd = '/home/sty/Documents/GitHub/mapsmirror';

export const queues = {
  childs: <Record<string, StyQueue>> {},
  childsCollapsed: <Record<string, number>> {},
  fetch: new StyQueue(10),
  fetched: 0,
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

let todoLast = 0;
let fetchedLast = 0;
setInterval(() => {
  const partialSum = (n: number) => (1 - Math.pow(4, n)) / (1 - 4);
  const todo = Object.entries(queues.childs).reduce(
    (sum, [key, queue]) => {
      const len = queue.length;
      const collapsed = queues.childsCollapsed[key] ?? 0;
      sum += Math.round(collapsed * partialSum(17 - parseInt(key)));
      sum += Math.round((len - collapsed) * partialSum(16 - parseInt(key)));
      return sum;
    }, 0);
  const done = todoLast - todo;
  todoLast = todo;
  console.log({
    childs: Object.fromEntries(
      Object.entries(queues.childs)
      .map(([key, queue]) => [key, queue.length])
      .filter(([, v]) => v),
    ),
    collapsed: Object.fromEntries(
      Object.entries(queues.childsCollapsed)
      .filter(([, v]) => v),
    ),
    fetched: `${queues.fetched - fetchedLast} (${queues.fetched})`,
    perf: {
      done,
      maxzoom,
      todo: todo.toPrecision(4),
    },
    queues: {
      fetch: queues.fetch.length,
      quiet: queues.quiet.length,
      verbose: queues.verbose.length,

    },
  });
  fetchedLast = queues.fetched;
  maxzoom = -1;
}, 2000);
