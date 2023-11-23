import { container, tileSize } from '.';
import { updateGeoLocation } from './getUserLocation';
import { position } from './position';
import { redraw } from './redraw';
import { lat2y } from './utils/lat2y';
import { lon2x } from './utils/lon2x';

export const onchange = (event: KeyboardEvent | WheelEvent | MouseEvent | UIEvent) => {
  if (!container) return;
  const { height, width } = container.getBoundingClientRect();
  const { type } = event;

  const zoomIn = () => {
    if (position.z < 20) {
      position.z++;
      position.x *= 2;
      position.y *= 2;
      position.tiles = 1 << position.z;
    }
  };
  const zoomOut = () => {
    if (position.z > 2) {
      position.z--;
      position.x /= 2;
      position.y /= 2;
      position.tiles = 1 << position.z;
    }
  };
  if (event instanceof WheelEvent) {
    const { clientX, clientY, deltaY } = event;

    if (deltaY > 0) {
      zoomOut();
      position.x -= (clientX - width / 2) / tileSize / 2;
      position.y -= (clientY - height / 2) / tileSize / 2;
    }
    else if (deltaY < 0) {
      zoomIn();
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
    if (key === 'ArrowLeft') position.x--;
    else if (key === 'ArrowRight') position.x++;
    else if (key === 'ArrowUp') position.y--;
    else if (key === 'ArrowDown') position.y++;
    else if (key === 'PageDown') zoomIn();
    else if (key === 'PageUp') zoomOut();
    else if (key === '1') position.source = 'osm';
    else if (key === '2') position.source = 'googlesat';
    else if (key === '3') position.source = 'navionics';
    else if (key === '4') position.source = 'googlestreet';
    else if (key === '5') position.source = 'googlehybrid';
    else if (key === '6') position.source = 'gebco';
    else if (key === '7') position.source = 'bingsat';
    else if (key === '8') position.source = 'bluemarble';
    else if (key === 'c') position.show.crosshairs = !position.show.crosshairs;
    else if (key === 'l') updateGeoLocation();
    else if (key === 'r') {
      position.x = Math.round(position.x);
      position.y = Math.round(position.y);
    }
    else if (key === 'u') {
      position.x = lon2x(position.user.longitude);
      position.y = lat2y(position.user.latitude);
    }
    else {
      console.log('noop', { key, type });
      return;
    }
  }
  else if (event instanceof MouseEvent) {
    const { clientX, clientY } = event;
    position.x = Math.round(position.x * tileSize + (position.mouse.x - clientX)) / tileSize;
    position.y = Math.round(position.y * tileSize + (position.mouse.y - clientY)) / tileSize;
  }

  position.y = Math.max(0, Math.min(position.y, position.tiles));

  redraw();
};
