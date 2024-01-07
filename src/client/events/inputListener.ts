import { round } from '../../common/math';
import { CoordsToggle } from '../containers/menu/coordsToggle';
import { CrosshairToggle } from '../containers/menu/crosshairToggle';
import { NavionicsDetailsToggle } from '../containers/menu/navionicsDetailsToggle';
import { NavionicsToggle } from '../containers/menu/navionicsToggle';
import { VfdensityToggle } from '../containers/menu/vfdensityToggle';
import { TilesContainer } from '../containers/tilesContainer';
import { baselayers } from '../globals/baselayers';
import { Markers } from '../globals/marker';
import { mouse } from '../globals/mouse';
import { position } from '../globals/position';
import { Settings } from '../globals/settings';
import { tileSize } from '../globals/tileSize';
import { MainContainer } from '../mainContainer';
import { updateUserLocation } from '../updateUserLocation';


export function inputListener (
  event: KeyboardEvent | WheelEvent | MouseEvent | UIEvent,
  { x, y }: {x: number, y: number} = { x: 0, y: 0 },
) {
  const { height, width } = MainContainer;
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
      if (typeof baselayer !== 'undefined') TilesContainer.baselayer = baselayer;
    }
    else if (key === 'c') CrosshairToggle.html.click();
    else if (key === 'd') CoordsToggle.html.click();
    else if (key === 'l') updateUserLocation();
    else if (key === 'n') {
      if (Settings.show.navionicsDetails && Settings.show.navionics) {
        NavionicsDetailsToggle.html.click();
        NavionicsToggle.html.click();
      }
      else if (Settings.show.navionics) NavionicsDetailsToggle.html.click();
      else NavionicsToggle.html.click();
    }
    else if (key === 'v') VfdensityToggle.html.click();
    else if (key === 'r') {
      position.xyz = {
        x: round(position.x),
        y: round(position.y),
      };
    }
    else if (key === 'u') {
      const userMarker = Markers.getMarker('user');
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
