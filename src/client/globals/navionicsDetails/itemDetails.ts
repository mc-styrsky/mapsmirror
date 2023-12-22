import type { NavionicsDetail } from '../navionicsDetails';
import { Container } from '../../utils/htmlElements/container';

export class NavionicsItemDetails extends Container {
  constructor (item: NavionicsDetail, itemId: string, accordionId: string) {
    super(Container.from('div', {
      classes: ['accordion-collapse', 'collapse', 'px-2'],
      dataset: {
        bsParent: `#${accordionId}`,
      },
      id: itemId,
    }));

    if (item.properties) item.properties.forEach(prop => {
      this.append(Container.from('p').append(prop));
    });
  }
}
