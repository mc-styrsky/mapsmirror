import { createHTMLElement } from './createHTMLElement';
import { container, tileSize } from './index';
import { position } from './position';
import { infoBox } from './redraw';
import { px2nm } from './utils/px2nm';
import { rad2deg } from './utils/rad2deg';
import { x2lon } from './utils/x2lon';
import { y2lat } from './utils/y2lat';

export const updateInfoBox = () => {
  if (!container) return;
  const { height, width } = container.getBoundingClientRect();


  const lat = y2lat(position.y);
  const lon = x2lon(position.x);
  const latMouse = y2lat(position.y + (position.mouse.y - height / 2) / tileSize);
  const lonMouse = x2lon(position.x + (position.mouse.x - width / 2) / tileSize);

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
    `Lat/Lon: ${rad2deg(lat, 2, 'NS')} ${rad2deg(lon, 3, 'EW')}`,
    createHTMLElement({ tag: 'br' }),
    `Mouse: ${rad2deg(latMouse, 2, 'NS')} ${rad2deg(lonMouse, 3, 'EW')}`,
    createHTMLElement({ tag: 'br' }),
    `User: ${rad2deg(position.user.latitude, 2, 'NS')} ${rad2deg(position.user.longitude, 3, 'EW')} (@${new Date(position.user.timestamp).toLocaleTimeString()})`,
  );
};
