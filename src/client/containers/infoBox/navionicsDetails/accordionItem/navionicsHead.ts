import type { NavionicsItemNode } from './navionicsItemNode';
import type { AccordionItem } from '../accordionItem';
import { Marker } from '../../../../globals/marker';
import { Container } from '../../../../utils/htmlElements/container';
import { overlayContainer } from '../../../overlayContainer';
import { navionicsDetails } from '../../navionicsDetails';

export class NavionicsHead extends Container implements NavionicsItemNode {
  constructor (item: AccordionItem) {
    super(Container.from('div', {
      classes: [
        ...item.details ?
          [
            'accordion-button',
            'collapsed',
          ] :
          ['d-flex'],
        'px-2',
        'py-0',
        'mm-menu-text',
      ],
      dataset: {
        bsTarget: `#navionicsItem${item.itemId}`,
        bsToggle: 'collapse',
        details: String(item.details),
      },
      onmousemove: (event) => {
        event.stopPropagation();
        navionicsDetails.marker = new Marker({
          ...item.position,
          id: item.itemId,
          type: 'navionics',
        });
        overlayContainer.redraw();
      },
    }));
  }
}
