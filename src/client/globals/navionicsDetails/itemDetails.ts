import type { NavionicsDetail } from '../navionicsDetails';
import { createHTMLElement } from '../../utils/createHTMLElement';

export function itemDetails (item: NavionicsDetail, itemId: string, accordionId: string) {
  if (item.properties) return createHTMLElement('div', {
    classes: ['accordion-collapse', 'collapse', 'px-2'],
    dataset: {
      bsParent: `#${accordionId}`,
    },
    id: itemId,
    zhilds: item.properties.map(prop => createHTMLElement('p', {
      zhilds: [prop],
    })),
  });
  return void 0;
}
