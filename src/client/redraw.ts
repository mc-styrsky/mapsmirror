import type { Size } from '../common/types/size';
import type { XYZ } from '../common/types/xyz';
import { modulo } from '../common/modulo';
import { createCrosshairsCanvas } from './containers/canvases/crosshairs';
import { createMapCanvas } from './containers/canvases/mapCanvas';
import { createNetCanvas } from './containers/canvases/net';
import { updateInfoBox } from './containers/infoBox/updateInfoBox';
import { mapContainer } from './containers/mapContainer';
import { overlayContainer } from './containers/overlayContainer';
import { position } from './globals/position';
import { settings } from './globals/settings';
import { tileSize } from './globals/tileSize';
import { boundingRect } from './index';
import { LocalStorageItem } from './utils/localStorageItem';
import { rad2deg } from './utils/rad2deg';
import { x2lon } from './utils/x2lon';
import { y2lat } from './utils/y2lat';

let working = false;
let newWorker: boolean = false;

function moveCanvas ({ canvas, height, width, x, y, z }: XYZ & Size & { canvas: HTMLCanvasElement; }) {
  const { map, tiles } = position;
  const scaleZ = z >= map.z ?
    1 << z - map.z :
    1 / (1 << map.z - z);
  const tiles_2 = tiles / 2;
  const shiftX = (modulo(map.x * scaleZ - x + tiles_2, tiles) - tiles_2) * tileSize;
  const shiftY = (modulo(map.y * scaleZ - y + tiles_2, tiles) - tiles_2) * tileSize;

  canvas.style.height = `${scaleZ * canvas.height}px`;
  canvas.style.width = `${scaleZ * canvas.width}px`;
  canvas.style.left = `${(width - canvas.width * scaleZ) / 2 + shiftX}px`;
  canvas.style.top = `${(height - canvas.height * scaleZ) / 2 + shiftY}px`;
}

let map: HTMLCanvasElement | null = null;

export async function redraw (type: string) {
  const { height, width } = boundingRect;

  const { tiles, ttl, x, y, z } = position;

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
    map = newCanvas;
    position.map.x = modulo(x, tiles);
    position.map.y = y;
    position.map.z = z;
    mapContainer.innerHTML = '';
    mapContainer.append(newCanvas);
  });

  (() => {
    const { origin, pathname, search } = window.location;
    const newsearch = `?${[
      ['z', z],
      ['ttl', ttl],
      ['x', rad2deg(x2lon(x)).toFixed(5)],
      ['y', rad2deg(y2lat(y)).toFixed(5)],
    ]
    .map(([k, v]) => `${k}=${v}`)
    .join('&')}`;
    if (newsearch !== search) {
      const newlocation = `${origin}${pathname}${newsearch}`;
      window.history.pushState({ path: newlocation }, '', newlocation);
    }
    new LocalStorageItem<typeof settings>('settings').set(settings);
  })();
  setTimeout(() => working = false, 100);
}
