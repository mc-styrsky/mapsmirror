import { setBaseLayer } from '../containers/menu/baselayerMenu';
import { coordsToggle } from '../containers/menu/coordsToggle';
import { crosshairToggle } from '../containers/menu/crosshairToggle';
import { navionicsToggle } from '../containers/menu/navionicsToggle';
import { vfdensityToggle } from '../containers/menu/vfdensityToggle';
import { updateGeoLocation } from '../getUserLocation';
import { mouse } from '../globals/mouse';
import { position } from '../globals/position';
import { settings } from '../globals/settings';
import { tileSize } from '../globals/tileSize';
import { boundingRect } from '../index';
import { redraw } from '../redraw';
import { lat2y } from '../utils/lat2y';
import { lon2x } from '../utils/lon2x';


export const onchange = (event: KeyboardEvent | WheelEvent | MouseEvent | UIEvent) => {
  const { height, width } = boundingRect;
  const { type } = event;
  let needRedraw = false;

  if (!(event.target instanceof HTMLBodyElement)) return;
  if (event instanceof WheelEvent) {
    const { clientX, clientY, deltaY } = event;

    if (deltaY > 0) {
      needRedraw = position.zoomOut();
      position.x -= (clientX - width / 2) / tileSize / 2;
      position.y -= (clientY - height / 2) / tileSize / 2;
    }
    else if (deltaY < 0) {
      needRedraw = position.zoomIn();
      position.x += (clientX - width / 2) / tileSize;
      position.y += (clientY - height / 2) / tileSize;
    }
    else {
      console.log('noop', { deltaY, type });
      return;
    }
  }
  else if (event instanceof KeyboardEvent) {
    if (event.isComposing) return;
    const { key } = event;
    if (key >= '0' && key <= '9') {
      setBaseLayer(settings.tiles.baselayers[parseInt(key)]);
    }
    else if (key === 'c') crosshairToggle.click();
    else if (key === 'd') coordsToggle.click();
    else if (key === 'l') updateGeoLocation();
    else if (key === 'n') navionicsToggle.click();
    else if (key === 'v') vfdensityToggle.click();
    else {
      needRedraw = true;
      if (key === 'r') {
        position.x = Math.round(position.x);
        position.y = Math.round(position.y);
      }
      else if (key === 'u') {
        position.x = lon2x(position.user.longitude);
        position.y = lat2y(position.user.latitude);
      }
      else if (key === 'ArrowLeft') position.x--;
      else if (key === 'ArrowRight') position.x++;
      else if (key === 'ArrowUp') position.y--;
      else if (key === 'ArrowDown') position.y++;
      else if (key === 'PageDown') position.zoomIn();
      else if (key === 'PageUp') position.zoomOut();
      else {
        needRedraw = false;
        console.log('noop', { key, type });
        return;
      }
    }
  }
  else if (event instanceof MouseEvent) {
    const { clientX, clientY } = event;
    position.x = Math.round(position.x * tileSize + (mouse.x - clientX)) / tileSize;
    position.y = Math.round(position.y * tileSize + (mouse.y - clientY)) / tileSize;
    needRedraw = true;
  }
  if (needRedraw) redraw(type);
};
