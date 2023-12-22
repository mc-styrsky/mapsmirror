import type { NavionicsDetail, NavionicsDetails } from '../navionicsDetails';
import { mapContainer } from '../../containers/mapContainer';
import { Container } from '../../utils/htmlElements/container';
import { Spinner } from '../../utils/htmlElements/spinner';
import { Marker } from '../marker';
import { NavionicsGoto } from './goto';
import { NavionicsIcon } from './icon';
import { NavionicsItemDetails } from './itemDetails';
import { NavionicsItemLabel } from './label';

export class AccordionItem extends Container {
  constructor ({ accordionId, idx, item, parent }: {
    accordionId: string;
    idx: number;
    item: NavionicsDetail;
    parent: NavionicsDetails;
  }) {
    const itemId = `navionicsDetailsItem${idx}`;
    super(Container.from('div', {
      classes: [
        'accordion-item',
        'mm-menu-text',
      ],
    }));

    this.append(
      Container.from('div', {
        classes: [
          'accordion-header',
          'mm-menu-text',
        ],
        onmousemove: (event) => {
          event.stopPropagation();
          if (parent.marker?.id !== item.id) {
            parent.marker = new Marker({
              ...item.position,
              id: item.id,
              type: 'navionics',
            });
            mapContainer.redraw('set navionics marker');
          }
        },
      })
      .append(
        Container.from('div', {
          classes: [
            ...item.properties ?
              ['accordion-button', 'collapsed'] :
              ['d-flex'],
            'px-2',
            'py-0',
            'mm-menu-text',
          ],
          dataset: item.properties ?
            {
              bsTarget: `#${itemId}`,
              bsToggle: 'collapse',
            } :
            {},
        })
        .append(
          Container.from('div', {
            classes: ['d-flex'],
            style: {
              width: '100%',
            },
          })
          .append(
            new NavionicsIcon(item),
            new NavionicsItemLabel(item),
            item.position ? new NavionicsGoto(item) : null,
            item.details && !item.properties ? new Spinner() : null,
          ),
        ),
      ),
    );
    if (item.properties) this.append(new NavionicsItemDetails(item, itemId, accordionId));
  }
}
