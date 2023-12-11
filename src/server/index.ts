import { StyQueue } from '@mc-styrsky/queue';
import express from 'express';
import { port } from '../common/consts';
import { getNavionicsIcon } from './requestHandler/getNavionicsIcon';
import { getNavionicsObjectinfo } from './requestHandler/getNavionicsObjectinfo';
import { getNavionicsQuickinfo } from './requestHandler/getNavionicsQuickinfo';
import { getTile } from './requestHandler/getTile';
import { printStats } from './utils/printStats';

export const pwd = '/home/sty/Documents/GitHub/mapsmirror';

export const queues = {
  checked: 0,
  childs: <Record<string, StyQueue>> {},
  childsCollapsed: <Record<string, number>> {},
  fetch: new StyQueue(10),
  fetched: 0,
  quiet: new StyQueue(1000),
  stats: 0,
  statsCount: 0,
  verbose: new StyQueue(100),
  worthit: 0,
  worthitCount: 0,
};

express()
.use(express.json())
.use(express.urlencoded({ extended: true }))
.use('', express.static('public'))
.get('/tile/:provider/:zoom/:x/:y', getTile)
.get('/navionics/icon/:iconId', getNavionicsIcon)
.get('/navionics/quickinfo/:z/:x/:y', getNavionicsQuickinfo)
.get('/navionics/objectinfo/:itemId', getNavionicsObjectinfo)
.listen(port, () => console.log(`backend listener running on port ${port}`))
.on('error', (e) => {
  console.error(`cannot start listener on port ${port}`);
  console.log(e);
});

setInterval(printStats, 2000);
