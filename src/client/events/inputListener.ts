import { coordsToggle } from '../containers/menu/coordsToggle';
import { crosshairToggle } from '../containers/menu/crosshairToggle';
import { navionicsDetailsToggle } from '../containers/menu/navionicsDetailsToggle';
import { navionicsToggle } from '../containers/menu/navionicsToggle';
import { vfdensityToggle } from '../containers/menu/vfdensityToggle';
import { mapContainer } from '../containers/tilesContainer';
import { baselayers } from '../globals/baselayers';
import { markers } from '../globals/marker';
import { mouse } from '../globals/mouse';
import { position } from '../globals/position';
import { settings } from '../globals/settings';
import { tileSize } from '../globals/tileSize';
import { mainContainer } from '../mainContainer';
import { updateUserLocation } from '../updateUserLocation';
import { round } from '../../common/math';


export function inputListener (
  event: KeyboardEvent | WheelEvent | MouseEvent | UIEvent,
  { x, y }: {x: number, y: number} = { x: 0, y: 0 },
) {
  const { height, width } = mainContainer;
  const { type } = event;

  console.log(event.target);
  if (event instanceof WheelEvent) {
    const { deltaY } = event;

    if (deltaY > 0) position.zoomOut({
      dx: (x - width / 2) / tileSize,
      dy: (y - height / 2) / tileSize,
    });
    else if (deltaY < 0) position.zoomIn({
      dx: (x - width / 2) / tileSize,
      dy: (y - height / 2) / tileSize,
    });
    else {
      console.log('noop', { deltaY, type });
      return;
    }
  }
  else if (event instanceof KeyboardEvent && event.target instanceof HTMLBodyElement) {
    if (event.isComposing) return;
    const { key } = event;
    if (key >= '0' && key <= '9') {
      const baselayer = baselayers[parseInt(key)];
      if (typeof baselayer !== 'undefined') mapContainer.baselayer = baselayer;
    }
    else if (key === 'c') crosshairToggle.html.click();
    else if (key === 'd') coordsToggle.html.click();
    else if (key === 'l') updateUserLocation();
    else if (key === 'n') {
      if (settings.show.navionicsDetails && settings.show.navionics) {
        navionicsDetailsToggle.html.click();
        navionicsToggle.html.click();
      }
      else if (settings.show.navionics) navionicsDetailsToggle.html.click();
      else navionicsToggle.html.click();
    }
    else if (key === 'v') vfdensityToggle.html.click();
    else if (key === 'r') {
      position.xyz = {
        x: round(position.x),
        y: round(position.y),
      };
    }
    else if (key === 'u') {
      const userMarker = markers.get('user');
      if (userMarker) position.xyz = userMarker;
    }
    else if (key === 'ArrowLeft') position.xyz = { x: position.x - 1 };
    else if (key === 'ArrowRight') position.xyz = { x: position.x + 1 };
    else if (key === 'ArrowUp') position.xyz = { y: position.y - 1 };
    else if (key === 'ArrowDown') position.xyz = { y: position.y + 1 };
    else if (key === 'PageDown') position.zoomIn();
    else if (key === 'PageUp') position.zoomOut();
    else {
      console.log('noop', { key, type });
      return;
    }
  }
  else if (event instanceof MouseEvent) {
    position.xyz = {
      x: round(position.x * tileSize + (mouse.x - x)) / tileSize,
      y: round(position.y * tileSize + (mouse.y - y)) / tileSize,
    };
  }
}
