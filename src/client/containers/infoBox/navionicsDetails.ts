import type { XYZ } from '../../../common/types/xyz';
import { StyQueue } from '@mc-styrsky/queue';
import { castObject } from '../../../common/extractProperties';
import { ceil, round, sqrt } from '../../../common/math';
import { mouse } from '../../globals/mouse';
import { position } from '../../globals/position';
import { settings } from '../../globals/settings';
import { tileSize } from '../../globals/tileSize';
import { deg2rad } from '../../utils/deg2rad';
import { Accordion } from '../../utils/htmlElements/accordion';
import { AccordionItem } from '../../utils/htmlElements/accordion/accordionItem';
import { Container } from '../../utils/htmlElements/container';
import { lat2y } from '../../utils/lat2y';
import { lon2x } from '../../utils/lon2x';
import { xyz2latLon } from '../../utils/xyz2latLon';
import { NavionicsItem } from './navionicsDetails/navionicsItem';


export class NavionicsDetails extends Container {
  constructor () {
    super();
    this.mainAccordion = new Accordion({ accordionId: this.accordionIdPrefix });
    this.append(this.mainAccordion);
    position.listeners.add(() => {
      if (!mouse.down.state) this.fetch(position);
    });
    this.queue.enqueue(() => new Promise(r => setInterval(r, 1)));
  }

  private readonly abortControllers: Set<AbortController> = new Set();
  private readonly accordionIdPrefix = 'navionicsDetailsList';
  private readonly accordions = new Map<string, Accordion>([]);
  private readonly fetchProgress = new AccordionItem({ headLabel: '', itemId: 'fetchProgress' });
  private readonly items: Map<string, NavionicsItem> = new Map();
  private readonly itemsCache: Map<string, NavionicsItem> = new Map();
  private readonly mainAccordion: Accordion;
  private readonly mainAccordionItems = new Map<string, AccordionItem>();
  private readonly queue = new StyQueue(1);

  private add = (itemId: string, item: NavionicsItem) => {
    this.items.set(itemId, item);
    this.refresh();
  };

  refresh = () => {
    const items = [...this.items.values()].sort((a, b) => a.distance - b.distance);

    const accordionKeys = new Set(this.mainAccordionItems.keys());
    const itemKeys = new Set(this.itemsCache.keys());

    for (let i = 0; i < items.length; i += 10) {
      const accordionId = `${this.accordionIdPrefix}${i}`;
      const accordion = this.accordions.get(accordionId) ?? new Accordion({ accordionId });
      if (!this.accordions.has(accordionId)) this.accordions.set(accordionId, accordion);

      const itemsSlice = items.slice(i, i + 10);
      const mainAccordionItem = this.mainAccordionItems.get(accordionId) ?? new AccordionItem({
        bodyLabel: accordion,
        headLabel: '',
        itemId: accordionId,
        show: i === 0,
      },
      );
      mainAccordionItem.headLabel = itemsSlice.length === 1 ?
        `${i + 1}` :
        `${i + 1}-${i + itemsSlice.length}`;
      if (!this.mainAccordionItems.has(accordionId)) this.mainAccordionItems.set(accordionId, mainAccordionItem);

      accordionKeys.delete(accordionId);

      this.mainAccordion.append(mainAccordionItem);

      itemsSlice.forEach(item => {
        accordion.append(item);
        itemKeys.delete(item.itemId);
      });
    }
    itemKeys.forEach(key => {
      const node = this.itemsCache.get(key)?.html;
      node?.parentNode?.removeChild(node);
    });
    accordionKeys.forEach(key => {
      const node = this.mainAccordionItems.get(key)?.html;
      node?.parentNode?.removeChild(node);
    });
    if (this.queue.length > 0) this.mainAccordion.append(this.fetchProgress);
    else this.fetchProgress.html.parentNode?.removeChild(this.fetchProgress.html);
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
      const { lat, lon } = xyz2latLon({ x, y, z });
      this.items.clear();
      this.refresh();
      const abortController = new AbortController();
      this.abortControllers.add(abortController);
      const { signal } = abortController;
      const max = 4;
      const perTile = 20;
      const points: { dx: number; dy: number; radius: number; }[] = [{
        dx: round(x * tileSize) / tileSize,
        dy: round(y * tileSize) / tileSize,
        radius: 0,
      }];
      for (let iX = -max; iX < max; iX++) {
        for (let iY = -max; iY < max; iY++) {
          const dx = ceil(x * perTile + iX) / perTile;
          const dy = ceil(y * perTile + iY) / perTile;
          const radius = sqrt((dx - x) * (dx - x) + (dy - y) * (dy - y));
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
          (body.items ?? [])
          .map(async (itemRemote: Record<string, any>) => {
            const {
              category_id: categoryId,
              details,
              icon_id: iconId,
              id: itemId,
              name: itemName,
              position: itemPosition,
            } = castObject(itemRemote, {
              category_id: String,
              details: Boolean,
              icon_id: String,
              id: String,
              name: String,
              position: ({ lat, lon }) => ({
                lat: deg2rad(lat),
                lon: deg2rad(lon),
                x: lon2x(deg2rad(lon)),
                y: lat2y(deg2rad(lat)),
              }),
            });
            const cachedItem = this.itemsCache.get(itemId);
            if (cachedItem) {
              cachedItem.reference = { lat, lon };
              this.add(itemId, cachedItem);
              return;
            }
            else if (![
              'depth_area',
              'depth_contour',
            ].includes(categoryId)) {
              const item = new NavionicsItem({
                details,
                iconId,
                itemId,
                itemName,
                itemPosition,
              });
              item.reference = { lat, lon };
              this.itemsCache.set(itemId, item);
              this.add(itemId, item);
            }
          });
        })
        .catch(rej => console.error(rej));
        await ret;
        done++;
        this.fetchProgress.headLabel = `${done}/${points.length}`;
        this.refresh();
        return prom;
      }, Promise.resolve());
      this.abortControllers.delete(abortController);
    });
    this.refresh();
  }
}

export const navionicsDetails = new NavionicsDetails();
