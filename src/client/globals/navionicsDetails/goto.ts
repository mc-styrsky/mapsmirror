import type { NavionicsDetail } from '../navionicsDetails';
import { mapContainer } from '../../containers/mapContainer';
import { bootstrapIcon } from '../../containers/menu/iconButton';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { lat2y } from '../../utils/lat2y';
import { lon2x } from '../../utils/lon2x';
import { position } from '../position';

export function goto (item: NavionicsDetail) {
  if (item.position) return createHTMLElement('a', {
    onclick: (event) => {
      const { lat, lon } = item.position;
      position.xyz = {
        x: lon2x(lon),
        y: lat2y(lat),
      };
      mapContainer.redraw('goto');
      event.stopPropagation();
    },
    style: {
      marginLeft: 'auto',
      padding: '0.25rem',
    },
    zhilds: [bootstrapIcon({ icon: 'arrow-right-circle' })],
  });
  return void 0;
}
