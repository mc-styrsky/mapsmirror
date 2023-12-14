import type { NavionicsDetail } from '../navionicsDetails';
import { createHTMLElement } from '../../utils/createHTMLElement';

export const label = (item: NavionicsDetail) => createHTMLElement({
  classes: ['d-flex'],
  tag: 'div',
  zhilds: [
    createHTMLElement({
      style: {
        margin: 'auto',
      },
      tag: 'div',
      zhilds: [
        item.name,
        createHTMLElement({
          style: {
            fontSize: '70%',
            marginLeft: '0.5rem',
          },
          tag: 'span',
          zhilds: [item.distance.toFixed(3), 'nm'],
        }),
      ],
    }),
  ],
});
