import { createCanvas } from './createCanvas';
import { createHTMLElement } from './createHTMLElement';
import { container } from './index';
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
  const { height, width } = container.getBoundingClientRect();

  if (canvas && position.zCanvas !== position.z) {
    if (position.zCanvas > position.z) {
      canvas.style.height = `${height / 2}px`;
      canvas.style.width = `${width / 2}px`;
      canvas.style.left = `${width / 4}px`;
      canvas.style.top = `${height / 4}px`;
    }
    if (position.zCanvas < position.z) {
      canvas.style.height = `${2 * height}px`;
      canvas.style.width = `${2 * width}px`;
      canvas.style.left = `${- width / 2}px`;
      canvas.style.top = `${- height / 2}px`;
    }
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  await createCanvas({
    height,
    width,
    ...position,
  })
  .then(newCanvas => {
    if (!container) return;
    canvas = newCanvas;
    position.zCanvas = position.z;
    container.innerHTML = '';
    container.append(newCanvas);
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
