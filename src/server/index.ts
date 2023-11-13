import { StyQueue } from '@mc-styrsky/queue';
import express from 'express';
import { port } from '../common/consts';
import { getTile } from './requestHandler/getTile';
import { printStats } from './utils/printStats';

export const pwd = '/home/sty/Documents/GitHub/mapsmirror';

export const queues = {
  childs: <Record<string, StyQueue>> {},
  childsCollapsed: <Record<string, number>> {},
  fetch: new StyQueue(10),
  fetched: 0,
  quiet: new StyQueue(1000),
  verbose: new StyQueue(100),
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

setInterval(printStats, 2000);
