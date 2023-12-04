import type { Size } from '../common/types/size';
import type { XYZ } from '../common/types/xyz';
import stringify from 'json-stable-stringify';
import { createCrosshairsCanvas } from './canvases/crosshairs';
import { createMapCanvas } from './canvases/mapCanvas';
import { createNetCanvas } from './canvases/net';
import { mapContainer } from './containers/mapContainer';
import { overlayContainer } from './containers/overlayContainer';
import { position } from './globals/position';
import { settings } from './globals/settings';
import { container, tileSize } from './index';
import { updateInfoBox } from './updateInfoBox';
import { imagesToFetch } from './utils/imagesToFetch';

let working = false;
let newWorker: boolean = false;

function moveCanvas ({ canvas, height, width, x, y, z }: XYZ & Size & { canvas: HTMLCanvasElement; }) {
  const scaleZ = z >= position.map.z ?
    1 << z - position.map.z :
    1 / (1 << position.map.z - z);
  const shiftX = (position.map.x * scaleZ - x) * tileSize;
  const shiftY = (position.map.y * scaleZ - y) * tileSize;

  canvas.style.height = `${scaleZ * canvas.height}px`;
  canvas.style.width = `${scaleZ * canvas.width}px`;
  canvas.style.left = `${(width - canvas.width * scaleZ) / 2 + shiftX}px`;
  canvas.style.top = `${(height - canvas.height * scaleZ) / 2 + shiftY}px`;
}

let map: HTMLCanvasElement | null = null;

export const redraw = async (type: string) => {
  if (!container) return;
  const { height, width } = container.getBoundingClientRect();

  const { tiles, x, y, z } = position;

  const crosshairs = createCrosshairsCanvas({ height, width, x, y });
  const net = createNetCanvas({ height, width, x, y });
  overlayContainer.innerHTML = '';
  overlayContainer.append(crosshairs, net);


  updateInfoBox();

  if (map) moveCanvas({ canvas: map, height, width, x, y, z });
  await new Promise(r => setTimeout(r, 1));


  if (working) {
    if (newWorker) return;
    newWorker = true;
    setTimeout(() => {
      newWorker = false;
      redraw(type);
    }, 10);
    return;
  }
  working = true;
  newWorker = false;
  console.log(`${type} redraw@${new Date().toISOString()}`);

  await createMapCanvas({ height, width, x, y, z })
  .then(newCanvas => {
    if (!container) return;
    position.x = (position.x + position.tiles) % position.tiles;
    map = newCanvas;
    position.map.x = (x + tiles) % tiles;
    position.map.y = y;
    position.map.z = z;
    mapContainer.innerHTML = '';
    mapContainer.append(newCanvas);
  });

  imagesToFetch.reset();
  (() => {
    const { origin, pathname, search } = window.location;
    const newsearch = `?z=${z}&${
      Object.entries({ ttl: position.ttl, x: position.x, y: position.y })
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    }`;
    if (newsearch !== search) {
      const newlocation = `${origin}${pathname}${newsearch}`;
      window.history.pushState({ path: newlocation }, '', newlocation);
    }
    const newsettings = stringify(settings);
    if (window.localStorage.getItem('settings') !== newsettings) {
      window.localStorage.setItem('settings', newsettings);
    }
  })();
  setTimeout(() => working = false, 100);
};
