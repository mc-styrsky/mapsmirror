import type { NavionicsDetail } from '../navionicsDetails';
import { createHTMLElement } from '../../utils/createHTMLElement';

export const spinner = (item: NavionicsDetail) => {
  if (item.details && !item.properties) return createHTMLElement({
    classes: ['d-flex'],
    tag: 'div',
    zhilds: [createHTMLElement({
      classes: [
        'spinner-border',
        'spinner-border-sm',
      ],
      style: {
        margin: 'auto',
      },
      tag: 'div',
    })],
  });
  return void 0;
};
