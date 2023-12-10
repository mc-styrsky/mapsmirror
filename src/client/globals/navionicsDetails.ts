import type { Marker } from './marker';
import type { XYZ } from '../../common/types/xyz';
import { StyQueue } from '@mc-styrsky/queue';
import { extractProperties } from '../../common/extractProperties';
import { updateInfoBox } from '../updateInfoBox';
import { createHTMLElement } from '../utils/createHTMLElement';
import { lat2y } from '../utils/lat2y';
import { lon2x } from '../utils/lon2x';
import { x2lon } from '../utils/x2lon';
import { y2lat } from '../utils/y2lat';
import { accordionItems } from './navionicsDetails/accordionItems';
import { settings } from './settings';

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

export class NavionicsDetails {
  constructor () {
    this.queue.enqueue(() => new Promise(r => setInterval(r, 1)));
  }
  private isFetch = false;
  private _list: Map<string, NavionicsDetail> = new Map();
  get list () {
    return this._list;
  }
  marker: Marker | undefined;
  private htmlList: HTMLElement | null = null;
  private queue = new StyQueue(1);

  add = (item: NavionicsDetail) => {
    this._list.set(item.id, item);
    this.htmlList = null;
  };
  clear = () => {
    this._list.clear();
    this.htmlList = null;
  };
  delete = (item: NavionicsDetail) => {
    this._list.delete(item.id);
    this.htmlList = null;
  };

  fetch = async ({ x, y, z }: XYZ) => {
    if (!settings.navionicsDetails.show) return;
    while (this.queue.shift()) (() => void 0)();
    await this.queue.enqueue(async () => {
      this.isFetch = true;
      navionicsDetails.clear();
      updateInfoBox();
      const listMap: Map<string, any> = new Map();
      const max = 1;
      const size = max * 2 + 1;
      await Promise.all(new Array(size * size).fill(0).map(async (_val, idx) => {
        const dx = (idx % size - max) / max * (max / 10);
        const dy = (Math.floor(idx / size) - max) / max * (max / 10);
        await fetch(`/navionics/quickinfo/${
          z
        }/${
          y2lat(y + dy, 1 << z) * 180 / Math.PI
        }/${
          x2lon(x + dx, 1 << z) * 180 / Math.PI
        }`)
        .then(
          async res => {
            if (!res.ok) return [];
            const body = await res.json();
            return body.items ?? [];
          },
          rej => {
            console.error(rej);
            return [];
          },
        )
        .then(async (list: any[]) => {
          list.forEach(i => listMap.set(i.id, i));
        });
      }))
      .then(async () => {
        const list = [...listMap.values()]
        .filter(i => ![
          'depth_area',
          'depth_contour',
        ].includes(i.category_id));
        await Promise.all(list.map(async (item: Record<string, any>) => {
          const {
            category_id,
            details,
            icon_id,
            id,
            name,
            position,
          } = extractProperties(item, {
            category_id: String,
            details: Boolean,
            icon_id: String,
            id: String,
            name: String,
            position: ({ lat, lon }) => ({
              lat: Number(lat),
              lon: Number(lon),
              x: lon2x(Number(lon) * Math.PI / 180),
              y: lat2y(Number(lat) * Math.PI / 180),
            }),
          });
          const distance = Math.sqrt(
            Math.pow(position.x - x, 2) +
            Math.pow(position.y - y, 2),

          );
          navionicsDetails.add({
            category_id,
            details,
            distance,
            icon_id,
            id,
            name,
            position,
          });
          updateInfoBox();
          if (item.details) {
            const { label, properties } = extractProperties(
              await fetch(`/navionics/objectinfo/${item.id}`)
              .then(
                async res => res.ok ? await res.json() : {},
                () => {},
              ),
              {
                label: String,
                properties: (val) => val?.map(({ label }) => label)?.filter(Boolean),
              },
            );
            navionicsDetails.add({
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
            updateInfoBox();
          }
        }));
      });
      this.isFetch = false;
    });
    this.htmlList = null;
    updateInfoBox();
  };

  toHtml = () => {
    const items = accordionItems(this);
    if (this.isFetch) items.push(createHTMLElement({
      classes: [
        'accordion-item',
        'mm-menu-text',
      ],
      tag: 'div',
      zhilds: [createHTMLElement({
        classes: [
          'accordion-header',
          'mm-menu-text',
        ],
        tag: 'div',
        zhilds: [createHTMLElement({
          classes: [
            'd-flex',
            'mm-menu-text',
          ],
          tag: 'div',
          zhilds: [createHTMLElement({
            classes: [
              'spinner-border',
              'spinner-border-sm',
            ],
            style: {
              margin: 'auto',
            },
            tag: 'div',
          })],
        })],
      })],
    }));
    this.htmlList ??= createHTMLElement({
      classes: ['accordion'],
      id: 'navionicsDetailsList',
      tag: 'div',
      zhilds: items,
    });
    return this.htmlList;
  };
}

export const navionicsDetails = new NavionicsDetails();
