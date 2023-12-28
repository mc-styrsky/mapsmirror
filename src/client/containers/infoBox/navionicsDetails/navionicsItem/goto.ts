import { position } from '../../../../globals/position';
import { Container } from '../../../../utils/htmlElements/container';
import { BootstrapIcon } from '../../../../utils/htmlElements/iconButton';
import { lat2y } from '../../../../utils/lat2y';
import { lon2x } from '../../../../utils/lon2x';
import { mapContainer } from '../../../mapContainer';

export class NavionicsGoto extends Container {
  constructor ({ lat, lon }: {lat: number, lon: number}) {
    super(Container.from('a', {
      onclick: (event) => {
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
