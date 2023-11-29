import { queues } from '..';

let todoLast = 0;
let fetchedLast = 0;
let maxzoom = -1;

export const getMaxzoom = () => maxzoom;
export const setMaxzoom = (z: number) => maxzoom = z;

export const printStats = () => {
  const partialSum = (n: number) => (1 - Math.pow(4, n)) / (1 - 4);
  const todo = Object.entries(queues.childs).reduce(
    (sum, [key, queue]) => {
      const len = queue.length;
      const collapsed = queues.childsCollapsed[key] ?? 0;
      sum += Math.round(collapsed * partialSum(17 - parseInt(key)));
      sum += Math.round(len * partialSum(16 - parseInt(key)));
      return sum;
    }, 0);
  const done = todoLast - todo;
  todoLast = todo;
  console.log({
    avg: { stats: queues.stats / queues.statsCount, worthit: queues.worthit / queues.worthitCount },
    childs: Object.fromEntries(
      Object.entries(queues.childs)
      .filter(([, v]) => v?.length)
      .map(([key, queue]) => [key, `${queue.length} (${queues.childsCollapsed[key] ?? 0})`]),
    ),
    fetched: `${queues.fetched - fetchedLast}/${queues.checked} (${queues.fetched})`,
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
  queues.checked = 0;
  queues.stats = 0;
  queues.statsCount = 0;
  queues.worthit = 0;
  queues.worthitCount = 0;
  maxzoom = -1;
};