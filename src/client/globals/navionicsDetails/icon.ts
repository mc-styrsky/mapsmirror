import type { NavionicsDetail } from '../navionicsDetails';
import { createHTMLElement } from '../../utils/createHTMLElement';


export function icon (item: NavionicsDetail) {
  return createHTMLElement('div', {
    classes: ['d-flex'],
    style: {
      height: '2em',
      width: '2em',
    },
    zhilds: [createHTMLElement('div', {
      style: {
        margin: 'auto',
      },
      zhilds: [
        createHTMLElement('img', {
          src: `/navionics/icon/${encodeURIComponent(item.icon_id)}`,
          style: {
            maxHeight: '1.5em',
            maxWidth: '1.5em',
          },
        }),
      ],
    })],
  });
}
