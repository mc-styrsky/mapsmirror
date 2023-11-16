import { createCanvas } from './createCanvas';
import { createHTMLElement } from './createHTMLElement';
import { container, tileSize } from './index';
import { position } from './position';
import { updateInfoBox } from './updateInfoBox';

let working = false;
let newWorker: boolean = false;
export const infoBox = createHTMLElement({
  style: {
    backgroundColor: '#80808080',
    borderBottomRightRadius: '1em',
    left: '0px',
    padding: '0.3em',
    position: 'absolute',
    top: '0px',
  },
  tag: 'div',
  zhilds: [
  ],
});

let canvas: HTMLCanvasElement | null = null;

export const redraw = async () => {
  if (!container) return;
  const { height, width } = container.getBoundingClientRect();

  if (canvas) {
    const scaleZ = position.z > position.canvas.z ?
      1 << position.z - position.canvas.z :
      1 / (1 << position.z - position.canvas.z);
    const shiftX = (position.canvas.x * scaleZ - position.x) * tileSize;
    const shiftY = (position.canvas.y * scaleZ - position.y) * tileSize;

    canvas.style.height = `${scaleZ * height}px`;
    canvas.style.width = `${scaleZ * width}px`;
    canvas.style.left = `${(width - width * scaleZ) / 2 + shiftX}px`;
    canvas.style.top = `${(height - height * scaleZ) / 2 + shiftY}px`;
    await new Promise(resolve => setTimeout(resolve, 1));
  }
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

  await createCanvas({
    height,
    width,
    ...position,
  })
  .then(newCanvas => {
    if (!container) return;
    // eslint-disable-next-line prefer-destructuring
    canvas = newCanvas.canvas;
    position.canvas.x = position.x;
    position.canvas.y = position.y;
    position.canvas.z = position.z;
    container.innerHTML = '';
    container.append(newCanvas.canvas);
    updateInfoBox();
    container.append(infoBox);
  });

  const newlocation = `${window.location.origin}${window.location.pathname}?${Object.entries({
    source: position.source,
    ttl: position.ttl,
    x: position.x,
    y: position.y,
    z: position.z,
  })
  .map(([k, v]) => `${k}=${v}`)
  .join('&')}`;
  window.history.pushState({ path: newlocation }, '', newlocation);

  setTimeout(() => working = false, 100);
};
