import { createHTMLElement } from './createHTMLElement';
import { container, position, tileSize } from './index';
import { rad2deg } from './rad2deg';
import { infoBox } from './redraw';
import { px2nm } from './utils/px2nm';
import { x2lon } from './utils/x2lon';
import { y2lat } from './utils/y2lat';

export const updateInfoBox = () => {
  if (!container) return;
  const { height, width } = container.getBoundingClientRect();

  const lat = y2lat(position.y);
  const lon = x2lon(position.x);
  const latMouse = y2lat(position.y + (position.mouse.y - height / 2) / tileSize);
  const lonMouse = x2lon(position.x + (position.mouse.x - width / 2) / tileSize);
  infoBox.innerHTML = '';
  infoBox.append(
    `TTL: ${position.ttl}`,
    createHTMLElement({ tag: 'br' }),
    `Zoom: ${position.z} (${px2nm(lat).toPrecision(3)}nm/px)`,
    createHTMLElement({ tag: 'br' }),
    `Lat/Lon: ${rad2deg(lat, 2, 'NS')} ${rad2deg(lon, 3, 'EW')}`,
    createHTMLElement({ tag: 'br' }),
    `Mouse: ${rad2deg(latMouse, 2, 'NS')} ${rad2deg(lonMouse, 3, 'EW')}`,
  );
};
