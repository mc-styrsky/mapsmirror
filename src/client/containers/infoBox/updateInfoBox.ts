import { mouse } from '../../globals/mouse';
import { navionicsDetails } from '../../globals/navionicsDetails';
import { position } from '../../globals/position';
import { settings } from '../../globals/settings';
import { tileSize } from '../../globals/tileSize';
import { boundingRect } from '../../index';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { px2nm } from '../../utils/px2nm';
import { rad2string } from '../../utils/rad2string';
import { x2lon } from '../../utils/x2lon';
import { y2lat } from '../../utils/y2lat';
import { infoBox } from '../infoBox';
import { imagesToFetch } from './imagesToFetch';
import { solarTimes } from './solarTimes';

export const updateInfoBox = () => {
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

  infoBox.innerHTML = '';
  infoBox.append(
    `Scale: ${scale} (Zoom ${position.z})`,
    createHTMLElement({ tag: 'br' }),
    `Lat/Lon: ${rad2string({ axis: 'NS', pad: 2, phi: lat })} ${rad2string({ axis: 'EW', pad: 3, phi: lon })}`,
    createHTMLElement({ tag: 'br' }),
    `Mouse: ${rad2string({ axis: 'NS', pad: 2, phi: latMouse })} ${rad2string({ axis: 'EW', pad: 3, phi: lonMouse })}`,
    createHTMLElement({ tag: 'br' }),
    `User: ${rad2string({ axis: 'NS', pad: 2, phi: position.user.latitude })} ${rad2string({ axis: 'EW', pad: 3, phi: position.user.longitude })} (@${new Date(position.user.timestamp).toLocaleTimeString()})`,

  );
  if (settings.navionicsDetails.show) infoBox.append(navionicsDetails.toHtml());
  infoBox.append(solarTimes.toHtml());
  infoBox.append(...imagesToFetch.stateHtml());
};
