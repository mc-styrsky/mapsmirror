import { settings } from '../globals/settings';
import { stylesheet } from '../globals/stylesheet';
import { Container } from '../utils/htmlElements/container';
import { imagesToFetch } from './infoBox/imagesToFetch';
import { InfoBoxCoords } from './infoBox/infoBoxCoords';
import { navionicsDetails } from './infoBox/navionicsDetails';
import { solarTimes } from './infoBox/suncalc/solarTimes';

stylesheet.addClass({
  InfoBox: {
    backgroundColor: '#aaaa',
    borderBottomLeftRadius: 'var(--bs-border-radius)',
    borderTopLeftRadius: 'var(--bs-border-radius)',
    position: 'absolute',
    right: '0',
    width: '20rem',
  },
},
);
class InfoBox extends Container {
  constructor () {
    super(Container.from('div', {
      classes: ['InfoBox', 'p-2', 'mt-2'],
    }));
  }
  refresh () {
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
