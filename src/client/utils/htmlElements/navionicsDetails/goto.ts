import type { NavionicsDetail } from '../navionicsDetails';
import { mapContainer } from '../../../containers/mapContainer';
import { position } from '../../../globals/position';
import { lat2y } from '../../lat2y';
import { lon2x } from '../../lon2x';
import { Container } from '../container';
import { BootstrapIcon } from '../iconButton';

export class NavionicsGoto extends Container {
  constructor (item: NavionicsDetail) {
    super(Container.from('a', {
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
    }));

    this.append(new BootstrapIcon({ icon: 'arrow-right-circle' }));
  }
}
