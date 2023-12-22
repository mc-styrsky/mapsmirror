import { settings } from '../globals/settings';
import { Container } from '../utils/htmlElements/container';
import { navionicsDetails } from '../utils/htmlElements/navionicsDetails';
import { imagesToFetch } from './infoBox/imagesToFetch';
import { InfoBoxCoords } from './infoBox/InfoBoxCoords';
import { solarTimes } from './infoBox/suncalc/solarTimes';

class InfoBox extends Container {
  constructor () {
    super(Container.from('div', {
      classes: ['p-2', 'mt-2'],
      style: {
        backgroundColor: '#aaaa',
        borderBottomLeftRadius: 'var(--bs-border-radius)',
        borderTopLeftRadius: 'var(--bs-border-radius)',
        position: 'absolute',
        right: '0',
        width: '20rem',
      },
    }));
  }
  update () {
    this.clear();
    this.append(new InfoBoxCoords());
    if (settings.show.navionicsDetails) this.append(navionicsDetails);
    if (settings.show.suncalc) {
      solarTimes.refresh();
      this.append(solarTimes);
    }
    imagesToFetch.refresh();
    this.append(imagesToFetch);
  }
}

export const infoBox = new InfoBox();
