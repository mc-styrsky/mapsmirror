import type { NavionicsDetail } from '../navionicsDetails';
import { Container } from '../../containers/container';
import { mapContainer } from '../../containers/mapContainer';
import { bootstrapIcon } from '../../containers/menu/iconButton';
import { lat2y } from '../../utils/lat2y';
import { lon2x } from '../../utils/lon2x';
import { position } from '../position';

export function goto (item: NavionicsDetail) {
  if (item.position) return Container.from('a', {
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
  })
  .append(bootstrapIcon({ icon: 'arrow-right-circle' }));
  return void 0;
}
