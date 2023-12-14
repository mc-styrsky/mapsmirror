import type { NavionicsDetail } from '../navionicsDetails';
import { redraw } from '../../redraw';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { lat2y } from '../../utils/lat2y';
import { lon2x } from '../../utils/lon2x';
import { position } from '../position';

export const goto = (item: NavionicsDetail) => {
  if (item.position) return createHTMLElement({
    onclick: (event) => {
      const { lat, lon } = item.position;
      position.xyz = {
        x: lon2x(lon),
        y: lat2y(lat),
      };
      redraw('goto');
      event.stopPropagation();
    },
    style: {
      marginLeft: 'auto',
      padding: '0.25rem',
    },
    tag: 'a',
    zhilds: [
      createHTMLElement({
        src: '/bootstrap-icons-1.11.2/arrow-right-circle.svg',
        style: {
          color: '#ff0000',
          height: '1.75rem',
        },
        tag: 'img',
      }),
    ],
  });
  return void 0;
};
