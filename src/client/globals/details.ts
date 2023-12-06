import { createHTMLElement } from '../utils/createHTMLElement';

type NavionicsDetail = {
  category_id: string,
  details: null | {
    label: string,
    properties: {
      label: string,
    }[],
    reviewable: false,
    routable: false,
  },
  distance: string,
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
  add = (item: NavionicsDetail) => {
    this.list.set(item.id, item);
  };
  delete = (item: NavionicsDetail) => {
    this.list.delete(item.id);
  };
  clear = () => this.list.clear();
  toHtml = () => [...this.list.values()].map(item => {
    return createHTMLElement({
      tag: 'div',
      zhilds: [
        createHTMLElement({
          src: `https://webapp.navionics.com/api/v2/assets/images/${item.icon_id}`,
          tag: 'img',
        }),
        item.name,
        item.name === item.details?.label ? null : item.details?.label,
        item.details ?
          item.details.properties.map(({ label }) => label).join(' ') :
          null,
      ].filter(Boolean),
    });
  });
}

export const details = new NavionicsDetails();
