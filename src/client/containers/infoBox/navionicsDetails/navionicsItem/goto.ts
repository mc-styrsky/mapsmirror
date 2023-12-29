import { position } from '../../../../globals/position';
import { stylesheet } from '../../../../globals/stylesheet';
import { Container } from '../../../../utils/htmlElements/container';
import { BootstrapIcon } from '../../../../utils/htmlElements/iconButton';
import { lat2y } from '../../../../utils/lat2y';
import { lon2x } from '../../../../utils/lon2x';
import { mapContainer } from '../../../tilesContainer';

stylesheet.addClass({
  NavionicsGoto: {
    margin: 'auto 0',
    padding: '0.25rem',
  },
});
export class NavionicsGoto extends Container {
  constructor ({ lat, lon }: {lat: number, lon: number}) {
    super(Container.from('div', {
      classes: ['NavionicsGoto'],
      onclick: (event) => {
        position.xyz = {
          x: lon2x(lon),
          y: lat2y(lat),
        };
        mapContainer.redraw('goto');
        event.stopPropagation();
      },
    }));

    this.append(new BootstrapIcon({ icon: 'arrow-right-circle' }));
  }
}
