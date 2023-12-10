import type { NavionicsDetail } from '../navionicsDetails';
import { createHTMLElement } from '../../utils/createHTMLElement';

export const itemDetails = (item: NavionicsDetail, nodeId: string) => {
  if (item.properties) return createHTMLElement({
    classes: ['accordion-collapse', 'collapse', 'px-2'],
    dataset: {
      bsParent: '#navionicsDetailsList',
    },
    id: nodeId,
    tag: 'div',
    zhilds: item.properties.map(prop => createHTMLElement({
      tag: 'p',
      zhilds: [prop],
    })),
  });
  return void 0;
};
