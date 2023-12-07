import { infoBox } from './containers/infoBox';
import { mouse } from './globals/mouse';
import { navionicsDetails } from './globals/navionicsDetails';
import { position } from './globals/position';
import { tileSize } from './globals/tileSize';
import { boundingRect } from './index';
import { createHTMLElement } from './utils/createHTMLElement';
import { imagesToFetch } from './utils/imagesToFetch';
import { px2nm } from './utils/px2nm';
import { rad2deg } from './utils/rad2deg';
import { x2lon } from './utils/x2lon';
import { y2lat } from './utils/y2lat';

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
    `Lat/Lon: ${rad2deg({ axis: 'NS', pad: 2, phi: lat })} ${rad2deg({ axis: 'EW', pad: 3, phi: lon })}`,
    createHTMLElement({ tag: 'br' }),
    `Mouse: ${rad2deg({ axis: 'NS', pad: 2, phi: latMouse })} ${rad2deg({ axis: 'EW', pad: 3, phi: lonMouse })}`,
    createHTMLElement({ tag: 'br' }),
    `User: ${rad2deg({ axis: 'NS', pad: 2, phi: position.user.latitude })} ${rad2deg({ axis: 'EW', pad: 3, phi: position.user.longitude })} (@${new Date(position.user.timestamp).toLocaleTimeString()})`,
    navionicsDetails.toHtml(),
    ...imagesToFetch.stateHtml(),
  );
};
