import type { NavionicsDetail } from '../navionicsDetails';
import { createHTMLElement } from '../../utils/createHTMLElement';

export function label (item: NavionicsDetail) {
  return createHTMLElement('div', {
    classes: ['d-flex'],
    zhilds: [
      createHTMLElement('div', {
        style: {
          margin: 'auto',
        },
        zhilds: [
          item.name,
          createHTMLElement('div', {
            style: {
              fontSize: '70%',
              marginLeft: '0.5rem',
            },
            zhilds: [item.distance.toFixed(3), 'nm'],
          }),
        ],
      }),
    ],
  });
}
