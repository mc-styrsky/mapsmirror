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
      zhilds: [item.name],
    }),
  ],
});
