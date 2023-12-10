import type { NavionicsDetails } from '../navionicsDetails';
import { redraw } from '../../redraw';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { Marker } from '../marker';
import { goto } from './goto';
import { icon } from './icon';
import { itemDetails } from './itemDetails';
import { label } from './label';
import { spinner } from './spinner';

export const accordionItems = (parent: NavionicsDetails) => [...parent.list.values()]
.sort((a, b) => a.distance - b.distance)
.map((item, idx) => {
  const nodeId = `navionicsDetailsItem${idx}`;
  return createHTMLElement({
    classes: [
      'accordion-item',
      'mm-menu-text',
    ],
    tag: 'div',
    zhilds: [
      createHTMLElement({
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
            redraw('set navionics marker');
          }
        },
        tag: 'div',
        zhilds: [
          createHTMLElement({
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
                bsTarget: `#${nodeId}`,
                bsToggle: 'collapse',
              } :
              {},
            tag: 'div',
            zhilds: [createHTMLElement({
              classes: ['d-flex'],
              style: {
                width: '100%',
              },
              tag: 'div',
              zhilds: [
                icon(item),
                label(item),
                goto(item),
                spinner(item),
              ],
            })],
          }),
        ],
      }),
      itemDetails(item, nodeId),
    ],
  });
});
