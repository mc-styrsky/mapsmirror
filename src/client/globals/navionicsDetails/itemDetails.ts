import type { NavionicsDetail } from '../navionicsDetails';
import { createHTMLElement } from '../../utils/createHTMLElement';

export function itemDetails (item: NavionicsDetail, itemId: string, accordionId: string) {
  if (item.properties) return createHTMLElement({
    classes: ['accordion-collapse', 'collapse', 'px-2'],
    dataset: {
      bsParent: `#${accordionId}`,
    },
    id: itemId,
    tag: 'div',
    zhilds: item.properties.map(prop => createHTMLElement({
      tag: 'p',
      zhilds: [prop],
    })),
  });
  return void 0;
}
