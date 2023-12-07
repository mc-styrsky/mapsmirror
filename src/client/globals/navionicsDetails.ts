import type { XYZ } from '../../common/types/xyz';
import { extractProperties } from '../../common/extractProperties';
import { updateInfoBox } from '../updateInfoBox';
import { createHTMLElement } from '../utils/createHTMLElement';
import { x2lon } from '../utils/x2lon';
import { y2lat } from '../utils/y2lat';

type NavionicsDetail = {
  category_id: string,
  label?: string,
  properties?: string[],
  details: boolean,
  icon_id: string,
  id: string,
  name: string,
  position: {
    lat: number,
    lon: number,
  },
};

class NavionicsDetails {
  private list: Map<string, NavionicsDetail> = new Map();
  private htmlList: HTMLElement | null = null;
  add = (item: NavionicsDetail) => {
    this.list.set(item.id, item);
    this.htmlList = null;
  };
  delete = (item: NavionicsDetail) => {
    this.list.delete(item.id);
    this.htmlList = null;
  };
  fetch = ({ x, y }: Pick<XYZ, 'x' | 'y'>) => {
    updateInfoBox();
    fetch(`/navionics/quickinfo/${y2lat(y) * 180 / Math.PI}/${x2lon(x) * 180 / Math.PI}`).then(
      async res => {
        if (!res.ok) return;
        const body = await res.json();
        const list = body.items ?? [];
        navionicsDetails.clear();
        await Promise.all(list.map(async (item: Record<string, any>) => {
          console.log(item);
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
            position: ({ lat, lon }) => ({ lat: Number(lat), lon: Number(lon) }),
          });
          navionicsDetails.add({
            category_id,
            details,
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
      },
      rej => console.error(rej),
    );
  };

  clear = () => {
    this.list.clear();
    this.htmlList = null;
  };

  toHtml = () => {
    this.htmlList ??= createHTMLElement({
      classes: ['accordion'],
      id: 'navionicsDetailsList',
      tag: 'div',
      zhilds: [...this.list.values()].map((item, idx) => {
        const nodeId = `navionicsDetailsItem${idx}`;
        return createHTMLElement({
          classes: ['accordion-item'],
          tag: 'div',
          zhilds: [
            createHTMLElement({
              classes: ['accordion-header'],
              tag: 'div',
              zhilds: [
                item.properties ?
                  createHTMLElement({
                    classes: ['accordion-button', 'collapsed', 'px-2', 'py-0'],
                    dataset: {
                      bsTarget: `#${nodeId}`,
                      bsToggle: 'collapse',
                    },
                    tag: 'button',
                    type: 'button',
                    zhilds: [
                      createHTMLElement({
                        src: `/navionics/icon/${encodeURIComponent(item.icon_id)}`,
                        tag: 'img',
                      }),
                      item.name,
                    ],
                  }) :
                  createHTMLElement({
                    classes: ['px-2', 'py-0'],
                    tag: 'div',
                    zhilds: [
                      createHTMLElement({
                        src: `/navionics/icon/${encodeURIComponent(item.icon_id)}`,
                        tag: 'img',
                      }),
                      item.name,
                    ],
                  }),
              ],
            }),
            item.properties ? createHTMLElement({
              classes: ['accordion-collapse', 'collapse', 'px-2'],
              dataset: {
                bsParent: '#navionicsDetailsList',
              },
              id: nodeId,
              tag: 'div',
              zhilds: [
                item.properties?.join('\n\n') ?? 'no details',
              ],
            }) : '',
          ],
        });
      }),
    });
    return this.htmlList;
  };
}

export const navionicsDetails = new NavionicsDetails();
