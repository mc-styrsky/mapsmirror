import type { Marker } from './marker';
import { StyQueue } from '@mc-styrsky/queue';
import { Container } from '../containers/container';
import { infoBox } from '../containers/infoBox';
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
  private htmlList: Container<HTMLDivElement> | null = null;
  queue = new StyQueue(1);

  add = (item: NavionicsDetail) => {
    this._list.set(item.id, item);
    this.clearHtmlList();
  };
  clear2 = () => {
    this._list.clear();
    this.clearHtmlList();
  };
  clearHtmlList = () => {
    this.htmlList = null;
    infoBox.update();
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
      });
      if (this.isFetch) ret.append(
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

      return ret;
    })();
    return this.htmlList;
  };
}

export const navionicsDetails = new NavionicsDetails();
