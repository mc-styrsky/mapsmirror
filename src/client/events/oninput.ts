import { mapContainer } from '../containers/mapContainer';
import { coordsToggle } from '../containers/menu/coordsToggle';
import { crosshairToggle } from '../containers/menu/crosshairToggle';
import { navionicsDetailsToggle } from '../containers/menu/navionicsDetailsToggle';
import { navionicsToggle } from '../containers/menu/navionicsToggle';
import { vfdensityToggle } from '../containers/menu/vfdensityToggle';
import { updateUserLocation } from '../getUserLocation';
import { baselayers } from '../globals/baselayers';
import { mouse } from '../globals/mouse';
import { position } from '../globals/position';
import { settings } from '../globals/settings';
import { tileSize } from '../globals/tileSize';
import { boundingRect } from '../index';
import { lat2y } from '../utils/lat2y';
import { lon2x } from '../utils/lon2x';


export function oninput (event: KeyboardEvent | WheelEvent | MouseEvent | UIEvent) {
  const { height, width } = boundingRect;
  const { type } = event;
  let needRedraw = false;

  console.log(event.target);
  if (![
    event.target instanceof HTMLBodyElement,
    // event.target instanceof Window,
  ].some(Boolean)) {
    return;
  }
  if (event instanceof WheelEvent) {
    const { clientX, clientY, deltaY } = event;

    if (deltaY > 0) {
      needRedraw = position.zoomOut();
      position.xyz = {
        x: position.x - (clientX - width / 2) / tileSize / 2,
        y: position.y - (clientY - height / 2) / tileSize / 2,
      };
    }
    else if (deltaY < 0) {
      needRedraw = position.zoomIn();
      position.xyz = {
        x: position.x + (clientX - width / 2) / tileSize,
        y: position.y + (clientY - height / 2) / tileSize,
      };
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
      const baselayer = baselayers[parseInt(key)];
      if (typeof baselayer !== 'undefined') mapContainer.baselayer = baselayer;
    }
    else if (key === 'c') crosshairToggle.click();
    else if (key === 'd') coordsToggle.click();
    else if (key === 'l') updateUserLocation();
    else if (key === 'n') {
      if (settings.show.navionicsDetails && settings.show.navionics) {
        navionicsDetailsToggle.click();
        navionicsToggle.click();
      }
      else if (settings.show.navionics) navionicsDetailsToggle.click();
      else navionicsToggle.click();
    }
    else if (key === 'v') vfdensityToggle.click();
    else {
      needRedraw = true;
      if (key === 'r') {
        position.xyz = {
          x: Math.round(position.x),
          y: Math.round(position.y),
        };
      }
      else if (key === 'u') {
        position.xyz = {
          x: lon2x(position.user.longitude),
          y: lat2y(position.user.latitude),
        };
      }
      else if (key === 'ArrowLeft') position.xyz = { x: position.x - 1 };
      else if (key === 'ArrowRight') position.xyz = { x: position.x + 1 };
      else if (key === 'ArrowUp') position.xyz = { y: position.y - 1 };
      else if (key === 'ArrowDown') position.xyz = { y: position.y + 1 };
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
    position.xyz = {
      x: Math.round(position.x * tileSize + (mouse.x - clientX)) / tileSize,
      y: Math.round(position.y * tileSize + (mouse.y - clientY)) / tileSize,
    };
    needRedraw = true;
  }
  if (needRedraw) {
    mapContainer.redraw(type);
  }
}
