import { mouse } from '../globals/mouse';
import { position } from '../globals/position';
import { settings } from '../globals/settings';
import { tileSize } from '../globals/tileSize';
import { boundingRect } from '../index';
import { Container } from '../utils/htmlElements/container';
import { navionicsDetails } from '../utils/htmlElements/navionicsDetails';
import { px2nm } from '../utils/px2nm';
import { rad2string } from '../utils/rad2string';
import { x2lon } from '../utils/x2lon';
import { y2lat } from '../utils/y2lat';
import { imagesToFetch } from './infoBox/imagesToFetch';
import { solarTimes } from './infoBox/suncalc/solarTimes';

class InfoBox extends Container {
  constructor () {
    super(Container.from('div', {
      classes: ['p-2', 'mt-2'],
      style: {
        backgroundColor: '#aaaa',
        borderBottomLeftRadius: 'var(--bs-border-radius)',
        borderTopLeftRadius: 'var(--bs-border-radius)',
        minWidth: '20rem',
        position: 'absolute',
        right: '0',
      },
    }));
  }
  update () {
    this.clear();
    this.append(coordinates());
    if (settings.show.navionicsDetails) this.append(navionicsDetails.html);
    if (settings.show.suncalc) {
      solarTimes.refresh();
      this.append(solarTimes);
    }
    imagesToFetch.refresh();
    this.append(imagesToFetch);
  }
}

const coordinates = () => {
  const { height, width } = boundingRect;

  const { x, y } = position;

  const lat = y2lat(y);
  const lon = x2lon(x);
  const latMouse = y2lat(y + (mouse.y - height / 2) / tileSize);
  const lonMouse = x2lon(x + (mouse.x - width / 2) / tileSize);

  const scale = (() => {
    let nm = px2nm(lat);
    let px = 1;

    if (nm >= 1) return `${px2nm(lat).toPrecision(3)}nm/px`;
    while (nm < 1) {
      nm *= 10;
      px *= 10;
    }
    return `${nm.toPrecision(3)}nm/${px.toFixed(0)}px`;
  })();
  return Container.from('div', {
    classes: [
      'float-end',
      'text-end',
    ],
    style: {
      width: 'fit-content',
    },
  })
  .append(
    `Scale: ${scale} (Zoom ${position.z})`,
    Container.from('br'),
    `Lat/Lon: ${rad2string({ axis: 'NS', pad: 2, phi: lat })} ${rad2string({ axis: 'EW', pad: 3, phi: lon })}`,
    Container.from('br'),
    `Mouse: ${rad2string({ axis: 'NS', pad: 2, phi: latMouse })} ${rad2string({ axis: 'EW', pad: 3, phi: lonMouse })}`,
    Container.from('br'),
    `User: ${rad2string({ axis: 'NS', pad: 2, phi: position.user.latitude })} ${rad2string({ axis: 'EW', pad: 3, phi: position.user.longitude })}`,
  );
};

export const infoBox = new InfoBox();
