import type { NavionicsDetail } from '../navionicsDetails';
import { Container } from '../../containers/container';

export function itemDetails (item: NavionicsDetail, itemId: string, accordionId: string) {
  if (item.properties) return Container.from('div', {
    classes: ['accordion-collapse', 'collapse', 'px-2'],
    dataset: {
      bsParent: `#${accordionId}`,
    },
    id: itemId,
  })
  .append(
    ...item.properties.map(prop => Container.from('p').append(prop)),
  );
  return void 0;
}
