import type { Marker } from './marker';
import { StyQueue } from '@mc-styrsky/queue';
import { updateInfoBox } from '../updateInfoBox';
import { createHTMLElement } from '../utils/createHTMLElement';
import { accordionItems } from './navionicsDetails/accordionItems';
import { getNavionicsDetailsList } from './navionicsDetails/getNavionicsDetailsList';

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
