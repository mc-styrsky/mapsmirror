import type { XYZ } from '../../../common/types/xyz';
import type { Marker } from '../../globals/marker';
import { StyQueue } from '@mc-styrsky/queue';
import { extractProperties } from '../../../common/extractProperties';
import { settings } from '../../globals/settings';
import { tileSize } from '../../globals/tileSize';
import { deg2rad } from '../../utils/deg2rad';
import { Container } from '../../utils/htmlElements/container';
import { lat2y } from '../../utils/lat2y';
import { lon2x } from '../../utils/lon2x';
import { px2nm } from '../../utils/px2nm';
import { infoBox } from '../infoBox';
import { Accordion } from './navionicsDetails/accordion';

export type NavionicsDetail = {
  category_id: string,
  label?: string,
  properties?: string[],
  details: boolean,
  distance: number,
  icon_id: string,
  id: string,
  name: string,
  position: {
    lat: number,
    lon: number,
  },
};

export class NavionicsDetails extends Container {
  constructor () {
    super();
    this.queue.enqueue(() => new Promise(r => setInterval(r, 1)));
  }
  private isFetch = false;
  private fetchProgress = '';
  readonly list: Map<string, NavionicsDetail> = new Map();
  marker: Marker | undefined;
  private queue = new StyQueue(1);
  private abortControllers: Set<AbortController> = new Set();


  private add = (item: NavionicsDetail) => {
    this.list.set(item.id, item);
    this.refresh();
  };
  delete = (item: NavionicsDetail) => {
    this.list.delete(item.id);
    this.refresh();
  };
  private refresh = () => {
    this.clear();
    this.append(new Accordion({
      items: [...this.list.values()].sort((a, b) => a.distance - b.distance),
      parent: this,
    }));
    if (this.isFetch) this.append(
      Container.from('div', {
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
      ),
    );
    infoBox.update();
  };

  async fetch (
    { x, y, z }: XYZ,
  ) {
    while (this.queue.shift()) (() => void 0)();
    this.abortControllers.forEach(ac => {
      ac.abort();
      this.abortControllers.delete(ac);
    });
    if (!settings.show.navionicsDetails) return;
    const listMap: Map<string, any> = new Map();
    await this.queue.enqueue(async () => {
      this.isFetch = true;
      this.list.clear();
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
          await Promise.all((body.items ?? []).map(async (item: Record<string, any>) => {
            if (listMap.has(item.id)) return;
            if ([
              'depth_area',
              'depth_contour',
            ].includes(item.category_id)) return;
            listMap.set(item.id, item);
            const {
              category_id, details, icon_id, id, name, position,
            } = extractProperties(item, {
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
            const pdx = position.x - x;
            const pdy = position.y - y;
            const distance = Math.sqrt(pdx * pdx + pdy * pdy) * tileSize * px2nm(position.lat);
            this.add({
              category_id,
              details,
              distance,
              icon_id,
              id,
              name,
              position,
            });
            if (item.details) {
              const { label, properties } = extractProperties(
                await fetch(`/navionics/objectinfo/${item.id}`, { signal })
                .then(async (res) => res.ok ? await res.json() : {})
                .catch(() => { }),
                {
                  label: String,
                  properties: (val) => val?.map(({ label }) => label)?.filter(Boolean),
                },
              );
              this.add({
                category_id,
                details,
                distance,
                icon_id,
                id,
                label,
                name,
                position,
                properties,
              });
            }
          }));
        })
        .catch(rej => console.error(rej));
        await ret;
        done++;
        this.fetchProgress = `${done}/${points.length}`;
        this.refresh();
        infoBox.update();
        return prom;
      }, Promise.resolve());
      this.abortControllers.delete(abortController);
      this.isFetch = false;
    });
    this.refresh();
  }
}

export const navionicsDetails = new NavionicsDetails();
