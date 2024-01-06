import { Settings } from '../globals/settings';
import { Stylesheet } from '../globals/stylesheet';
import { Container } from '../utils/htmlElements/container';
import { MonoContainer } from '../utils/htmlElements/monoContainer';
import { ImagesToFetch } from './infoBox/imagesToFetch';
import { InfoBoxCoords } from './infoBox/infoBoxCoords';
import { NavionicsDetails } from './infoBox/navionicsDetails';
import { SolarTimes } from './infoBox/suncalc/solarTimes';
import { NavionicsDetailsToggle } from './menu/navionicsDetailsToggle';

Stylesheet.addClass({
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
export class InfoBox extends MonoContainer {
  static {
    this.copyInstance(new Container('div', {
      classes: ['InfoBox', 'p-2', 'mt-2'],
    }), this);
    NavionicsDetailsToggle.listeners.add(() => this.refresh());
    this.refresh();
  }
  static refresh () {
    this.clear();
    this.append(InfoBoxCoords);
    if (Settings.show.navionicsDetails) this.append(NavionicsDetails);
    if (Settings.show.suncalc) this.append(SolarTimes);

    this.append(ImagesToFetch);
  }
}
