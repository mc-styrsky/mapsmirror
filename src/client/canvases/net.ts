import type { Size } from '../../common/types/size';
import type { XYZ } from '../../common/types/xyz';
import { createHTMLElement } from '../createHTMLElement';
import { tileSize } from '../index';
import { lat2y } from '../utils/lat2y';
import { lon2x } from '../utils/lon2x';
import { min2rad } from '../utils/min2rad';
import { px2nm } from '../utils/px2nm';
import { rad2deg } from '../utils/rad2deg';
import { x2lon } from '../utils/x2lon';
import { y2lat } from '../utils/y2lat';

const scales = [
  0.1,
  0.2,
  0.5,
  1,
  2,
  5,
  10,
  15,
  20,
  30,
  60,
  2 * 60,
  5 * 60,
  10 * 60,
  15 * 60,
  20 * 60,
  30 * 60,
  45 * 60,
];
const getScale = (lat: number, minPx = 100) => {
  const target = px2nm(lat) * minPx;
  return min2rad(scales.reduce((prev, curr) => {
    return prev > target ?
      prev :
      curr;
  }, scales[0]));
};

export const createNetCanvas = ({
  height,
  width,
  x,
  y,
}: Pick<XYZ, 'x' | 'y'> & Size) => {
  const canvas = createHTMLElement({
    height: height,
    style: {
      height: `${height}px`,
      position: 'absolute',
      width: `${width}px`,
    },
    tag: 'canvas',
    width: width,
  });
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  context.translate(width / 2, height / 2);
  const lat = y2lat(y);
  const scaleX = getScale(0, context.measureText(rad2deg({ axis: 'WW', pad: 3, phi: 0 })).width);
  const scaleY = getScale(lat);

  const left = x - width / 2 / tileSize;
  const right = x + width / 2 / tileSize;
  const top = y - height / 2 / tileSize;
  const bottom = y + height / 2 / tileSize;


  context.beginPath();
  context.strokeStyle = '#808080';
  const latTop = Math.floor(y2lat(top) / scaleY) * scaleY;
  const latBottom = Math.ceil(y2lat(bottom) / scaleY) * scaleY;
  for (let ctr = 0; ctr < 1000; ctr++) {
    const latGrid = latTop - scaleY * ctr;
    if (latGrid < latBottom) break;
    const gridY = lat2y(latGrid);
    context.strokeText(
      rad2deg({ axis: 'NS', pad: 2, phi: latGrid }),
      (left - x) * tileSize + 3,
      (gridY - y) * tileSize - 3,
    );
    context.moveTo((left - x) * tileSize, (gridY - y) * tileSize);
    context.lineTo((right - x) * tileSize, (gridY - y) * tileSize);
  }
  const lonLeft = Math.floor(x2lon(left) / scaleX) * scaleX;
  const lonRight = Math.ceil(x2lon(right) / scaleX) * scaleX;
  for (let ctr = 0; ctr < 1000; ctr++) {
    const lonGrid = lonLeft + scaleX * ctr;
    if (lonGrid > lonRight) break;
    const gridX = lon2x(lonGrid);
    context.strokeText(
      rad2deg({ axis: 'EW', pad: 3, phi: lonGrid }),
      (gridX - x) * tileSize + 3,
      (bottom - y) * tileSize - 3,
    );
    // console.log(`${rad2deg(lonGrid, 2, 'NS')}: (${left - x}/${gridY - y}) - (${right - x}/${gridY - y})`);
    context.moveTo((gridX - x) * tileSize, (top - y) * tileSize);
    context.lineTo((gridX - x) * tileSize, (bottom - y) * tileSize);
  }
  context.stroke();
  return canvas;
};
