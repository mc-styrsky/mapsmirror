import type { NavionicsDetail } from '../navionicsDetails';
import stringify from 'json-stable-stringify';
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
      title: stringify(item, { space: 2 }),
      zhilds: [item.name],
    }),
  ],
});
