import type { NavionicsDetail } from '../navionicsDetails';
import { createHTMLElement } from '../../utils/createHTMLElement';

export function spinner (item: NavionicsDetail) {
  if (item.details && !item.properties) return createHTMLElement('div', {
    classes: ['d-flex'],
    zhilds: [createHTMLElement('div', {
      classes: [
        'spinner-border',
        'spinner-border-sm',
      ],
      style: {
        margin: 'auto',
      },
    })],
  });
  return void 0;
}
