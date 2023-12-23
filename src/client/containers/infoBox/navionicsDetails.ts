import type { NavionicsDetailConstructor } from './navionicsDetails/accordionItem';
import type { XYZ } from '../../../common/types/xyz';
import type { Marker } from '../../globals/marker';
import { StyQueue } from '@mc-styrsky/queue';
import { settings } from '../../globals/settings';
import { tileSize } from '../../globals/tileSize';
import { Container } from '../../utils/htmlElements/container';
import { Accordion } from './navionicsDetails/accordion';
import { AccordionItem } from './navionicsDetails/accordionItem';


export class NavionicsDetails extends Container {
  constructor () {
    super();
    this.queue.enqueue(() => new Promise(r => setInterval(r, 1)));
  }
  private isFetch = false;
  private readonly fetchProgress = Container.from('div', { classes: ['d-flex'] });
  readonly items: Map<string, AccordionItem> = new Map();
  readonly itemsCache: Map<string, AccordionItem> = new Map();
  marker: Marker | undefined;
  private readonly queue = new StyQueue(1);
  private readonly abortControllers: Set<AbortController> = new Set();
  private readonly spinner = Container.from('div', {
    classes: [
      'accordion-item',
      'mm-menu-text',
    ],
  })
  .append(
    Container.from('div', {
      classes: [
        'accordion-header',
        'mm-menu-text',
      ],
    })
    .append(
      Container.from('div', {
        classes: [
          'd-flex',
          'mm-menu-text',
        ],
      })
      .append(
        this.fetchProgress,
        Container.from('div', {
          classes: [
            'spinner-border',
            'spinner-border-sm',
          ],
          style: {
            margin: 'auto',
          },
        }),
      ),
    ),
  );

  private add = (item: AccordionItem) => {
    this.items.set(item.itemId, item);
    this.refresh();
  };
  refresh = () => {
    this.clear();
    this.append(new Accordion({
      items: [...this.items.values()].sort((a, b) => a.distance - b.distance),
      parent: this,
    }));
    if (this.isFetch) this.append(this.spinner);
  };

  async fetch (
    { x, y, z }: XYZ,
  ) {
    while (this.queue.shift()) (() => void 0)();
    this.abortControllers.forEach(ac => {
      ac.abort();
    });
    if (!settings.show.navionicsDetails) return;
    await this.queue.enqueue(async () => {
      this.isFetch = true;
      this.items.clear();
      this.refresh();
      const abortController = new AbortController();
      this.abortControllers.add(abortController);
      const { signal } = abortController;
      const max = 4;
      const perTile = 20;
      const points: { dx: number; dy: number; radius: number; }[] = [{
        dx: Math.round(x * tileSize) / tileSize,
        dy: Math.round(y * tileSize) / tileSize,
        radius: 0,
      }];
      for (let iX = -max; iX < max; iX++) {
        for (let iY = -max; iY < max; iY++) {
          const dx = Math.ceil(x * perTile + iX) / perTile;
          const dy = Math.ceil(y * perTile + iY) / perTile;
          const radius = Math.sqrt((dx - x) * (dx - x) + (dy - y) * (dy - y));
          points.push({ dx, dy, radius });
        }
      }
      let done = 0;
      await points
      .sort((a, b) => a.radius - b.radius)
      .reduce(async (prom, { dx, dy }) => {
        const ret = fetch(`/navionics/quickinfo/${z}/${dx}/${dy}`, { signal })
        .then(async (res) => {
          if (!res.ok) return;
          const body = await res.json();
          await Promise.all((body.items ?? [])
          .map(async (itemRemote: NavionicsDetailConstructor) => {
            const cachedItem = this.itemsCache.get(itemRemote.id);
            if (cachedItem) {
              cachedItem.setReference({ x, y });
              this.add(cachedItem);
              return;
            }
            else if (![
              'depth_area',
              'depth_contour',
            ].includes(itemRemote.category_id)) {
              const item = new AccordionItem(itemRemote);
              item.setReference({ x, y });
              this.itemsCache.set(item.itemId, item);
              this.add(item);
            }
          }));
        })
        .catch(rej => console.error(rej));
        await ret;
        done++;
        this.fetchProgress.clear();
        this.fetchProgress.append(`${done}/${points.length}`);
        this.refresh();
        return prom;
      }, Promise.resolve());
      this.abortControllers.delete(abortController);
      this.isFetch = false;
    });
    this.refresh();
  }
}

export const navionicsDetails = new NavionicsDetails();
