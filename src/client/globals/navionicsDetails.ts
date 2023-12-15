import type { Marker } from './marker';
import { StyQueue } from '@mc-styrsky/queue';
import { updateInfoBox } from '../containers/infoBox/updateInfoBox';
import { createHTMLElement } from '../utils/createHTMLElement';
import { getNavionicsDetailsList } from './navionicsDetails/getNavionicsDetailsList';
import { toAccordion } from './navionicsDetails/toAccordion';

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
  isFetch = false;
  fetchProgress = '';
  private _list: Map<string, NavionicsDetail> = new Map();
  get list () {
    return this._list;
  }
  marker: Marker | undefined;
  private htmlList: HTMLElement | null = null;
  queue = new StyQueue(1);

  add = (item: NavionicsDetail) => {
    this._list.set(item.id, item);
    this.clearHtmlList();
  };
  clear = () => {
    this._list.clear();
    this.clearHtmlList();
  };
  clearHtmlList = () => {
    this.htmlList = null;
    updateInfoBox();
  };
  delete = (item: NavionicsDetail) => {
    this._list.delete(item.id);
    this.clearHtmlList();
  };

  fetch = ({ x, y, z }) => getNavionicsDetailsList({ parent: this, x, y, z });

  toHtml = () => {
    this.htmlList ??= (() => {
      const ret = toAccordion({
        items: [...this.list.values()].sort((a, b) => a.distance - b.distance),
        parent: this,
      },
      );
      if (this.isFetch) ret.append(createHTMLElement({
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
            zhilds: [
              this.fetchProgress,
              createHTMLElement({
                classes: [
                  'spinner-border',
                  'spinner-border-sm',
                ],
                style: {
                  margin: 'auto',
                },
                tag: 'div',
              }),
            ],
          })],
        })],
      }));

      return ret;
    })();
    return this.htmlList;
  };
}

export const navionicsDetails = new NavionicsDetails();
