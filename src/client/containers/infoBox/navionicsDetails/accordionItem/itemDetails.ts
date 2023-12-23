import type { NavionicsItemNode } from './navionicsItemNode';
import type { AccordionItem } from '../accordionItem';
import { extractProperties } from '../../../../../common/extractProperties';
import { Container } from '../../../../utils/htmlElements/container';

export class NavionicsItemDetails extends Container implements NavionicsItemNode {
  constructor (item: AccordionItem) {
    super(Container.from('div', {
      classes: ['accordion-collapse', 'collapse', 'px-2'],
      dataset: {
        // bsParent: `#${item.accordionId}`,
      },
      id: `navionicsItem${item.itemId}`,
    }));

    this.append('fetching...');

    fetch(`/navionics/objectinfo/${item.itemId}`)
    .then(async (res) => res.ok ? await res.json() : {})
    .catch(() => ({}))
    .then(body => {
      const { label, properties } = extractProperties(body,
        {
          label: String,
          properties: (val) => val?.map(({ label }) => String(label))?.filter(Boolean),
        },
      );
      item.label = label,
      item.properties = properties;
      this.clear();
      if (properties) properties.forEach(prop => {
        this.append(Container.from('p').append(prop));
      });
      item.refresh();
    });
  }
}
