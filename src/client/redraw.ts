import type { Size } from '../common/types/size';
import type { XYZ } from '../common/types/xyz';
import { createCrosshairsCanvas } from './canvases/crosshairs';
import { createMapCanvas } from './canvases/mapCanvas';
import { createNetCanvas } from './canvases/net';
import { mapContainer } from './containers/mapContainer';
import { overlayContainer } from './containers/overlayContainer';
import { container, tileSize } from './index';
import { position } from './position';
import { updateInfoBox } from './updateInfoBox';

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

export const redraw = async () => {
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
      redraw();
    }, 10);
    return;
  }
  working = true;
  newWorker = false;
  console.log('redraw');

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

  const newlocation = `${
    window.location.origin
  }${
    window.location.pathname
  }?${
    Object.entries({ source: position.source, ttl: position.ttl, x: position.x, y, z })
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  }`;
  window.history.pushState({ path: newlocation }, '', newlocation);

  setTimeout(() => working = false, 100);
};
