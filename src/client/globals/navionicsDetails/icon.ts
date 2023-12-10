import type { NavionicsDetail } from '../navionicsDetails';
import { createHTMLElement } from '../../utils/createHTMLElement';


export const icon = (item: NavionicsDetail) => createHTMLElement({
  classes: ['d-flex'],
  style: {
    height: '2em',
    width: '2em',
  },
  tag: 'div',
  zhilds: [createHTMLElement({
    style: {
      margin: 'auto',
    },
    tag: 'div',
    zhilds: [
      createHTMLElement({
        src: `/navionics/icon/${encodeURIComponent(item.icon_id)}`,
        style: {
          maxHeight: '1.5em',
          maxWidth: '1.5em',
        },
        tag: 'img',
      }),
    ],
  })],
});
