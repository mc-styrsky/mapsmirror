import type { NavionicsDetail, NavionicsDetails } from '../navionicsDetails';
import { Container } from '../../containers/container';
import { mapContainer } from '../../containers/mapContainer';
import { Marker } from '../marker';
import { goto } from './goto';
import { icon } from './icon';
import { itemDetails } from './itemDetails';
import { label } from './label';
import { spinner } from './spinner';

export function accordionItem ({ accordionId, idx, item, parent }: {
  accordionId: string;
  idx: number;
  item: NavionicsDetail;
  parent: NavionicsDetails;
}) {
  const itemId = `navionicsDetailsItem${idx}`;
  return Container.from('div', {
    classes: [
      'accordion-item',
      'mm-menu-text',
    ],
  })
  .append(
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
      .append(Container.from('div', {
        classes: ['d-flex'],
        style: {
          width: '100%',
        },
      })
      .append(
        icon(item),
        label(item),
        goto(item),
        spinner(item),
      ),
      ),
    ),
    itemDetails(item, itemId, accordionId),
  );
}
