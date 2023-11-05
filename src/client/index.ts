import { createHTMLElement } from './createHTMLElement';
const {
  container: containerId = '',
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());

const container = document.getElementById(containerId);
const position = {
  x: 1,
  y: 1,
  z: 1,
};

const tileSize = 256;

const createImages = ({
  centerX,
  centerY,
  countX,
  countY,
  x,
  y,
  z,
}: {
  centerX: number;
  centerY: number;
  countX: number;
  countY: number;
  x: number;
  y: number;
  z: number;
}) => {
  console.log({
    centerX,
    centerY,
    countX,
    countY,
    x,
    y,
    z,
  });
  const images: HTMLImageElement[] = [];
  for (let dy = 0 - countY; dy <= countY; dy++) {
    if (y + dy < 0) continue;
    if (y + dy >= 1 << z) continue;
    for (let dx = 0 - countX; dx <= countX; dx++) {
      console.log({ countX, countY, x: dx, y: dy });
      const image = createHTMLElement({
        src: `http://localhost:3000/tile/osm/${[
          z,
          Math.floor(x + dx).toString(16),
          Math.floor(y + dy).toString(16),
        ].join('/')}?ttl=4`,
        style: {
          left: `${centerX + (dx - x + Math.floor(x)) * tileSize}px`,
          position: 'absolute',
          top: `${centerY + (dy - y + Math.floor(y)) * tileSize}px`,
        },
        tag: 'img',
      });
      images.push(image);
    }
  }
  return images;
};

if (container) {
  const redraw = () => {
    console.log('redraw');
    const { height, width } = container.getBoundingClientRect();

    const viewport = {
      centerX: Math.round(width / 2),
      centerY: Math.round(height / 2),
    };
    const countX = Math.ceil(viewport.centerX / tileSize);
    const countY = Math.ceil(viewport.centerY / tileSize);
    container.innerHTML = '';
    container.append(...createImages({
      centerX: viewport.centerX,
      centerY: viewport.centerY,
      countX,
      countY,
      x: position.x,
      y: position.y,
      z: position.z,
    }));
  };

  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.isComposing) return;
    const { key } = event;
    if (key === 'ArrowLeft') position.x--;
    else if (key === 'ArrowRight') position.x++;
    else if (key === 'ArrowUp') position.y--;
    else if (key === 'ArrowDown') position.y++;
    else if (key === '+' && position.z < 17) {
      position.z++;
      position.x *= 2;
      position.y *= 2;
    }
    else if (key === '-' && position.z > 0) {
      position.z--;
      position.x /= 2;
      position.y /= 2;
    }
    else {
      console.log('noop', { event, key });
      return;
    }

    position.y = Math.max(0, Math.min(position.y, (1 << position.z) - 1));

    console.log('v2', { event, key });
    redraw();
  });
  redraw();
}
