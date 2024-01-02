import type { Overlay } from '../../../common/types/overlay';
import { tileSize } from '../../globals/tileSize';
import { lat2y } from '../../utils/lat2y';
import { lon2x } from '../../utils/lon2x';
import { ceil, floor } from '../../../common/math';
import { nm2rad } from '../../utils/min2rad';
import { px2nm } from '../../utils/px2nm';
import { rad2string } from '../../utils/rad2string';
import { x2lon } from '../../utils/x2lon';
import { y2lat } from '../../utils/y2lat';

const scales = [
  0.025,
  0.05,
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
  return nm2rad(scales.reduce((prev, curr) => {
    return prev > target ?
      prev :
      curr;
  }, scales[0]));
};

export const drawNet = ({
  context,
  height,
  width,
  x,
  y,
}: Overlay) => {
  const lat = y2lat(y);
  const scaleX = getScale(0, context.measureText(rad2string({ axis: 'EW', pad: 3, phi: 0 })).width);
  const scaleY = getScale(lat);

  const left = x - width / 2 / tileSize;
  const right = x + width / 2 / tileSize;
  const top = y - height / 2 / tileSize;
  const bottom = y + height / 2 / tileSize;

  const strokeText = (text: string, x: number, y: number) => {
    context.strokeText(text, x, y);
    context.fillText(text, x, y);
  };

  const latTop = floor(y2lat(top) / scaleY) * scaleY;
  const latBottom = ceil(y2lat(bottom) / scaleY) * scaleY;
  const pointsY: {latGrid: number, x1: number, x2: number, y1: number}[] = [];
  for (let ctr = 0; ctr < 1000; ctr++) {
    const latGrid = latTop - scaleY * ctr;
    if (latGrid < latBottom) break;
    pointsY.push({
      latGrid,
      x1: (left - x) * tileSize,
      x2: (right - x) * tileSize,
      y1: (lat2y(latGrid) - y) * tileSize,
    });
  }
  const lonLeft = floor(x2lon(left) / scaleX) * scaleX;
  const lonRight = ceil(x2lon(right) / scaleX) * scaleX;
  const pointsX: {lonGrid: number, y1: number, y2: number, x1: number}[] = [];
  for (let ctr = 0; ctr < 1000; ctr++) {
    const lonGrid = lonLeft + scaleX * ctr;
    if (lonGrid > lonRight) break;
    pointsX.push({
      lonGrid,
      x1: (lon2x(lonGrid) - x) * tileSize,
      y1: (top - y) * tileSize,
      y2: (bottom - y) * tileSize,
    });
  }

  context.beginPath();
  context.strokeStyle = '#808080';
  pointsY.forEach(({ x1, x2, y1 }) => {
    context.moveTo(x1, y1);
    context.lineTo(x2, y1);
  });
  pointsX.forEach(({ x1, y1, y2 }) => {
    context.moveTo(x1, y1);
    context.lineTo(x1, y2);
  });
  context.stroke();

  context.beginPath();
  context.strokeStyle = '#ffffff';
  context.fillStyle = '#000000';
  context.lineWidth = 3;
  pointsY.forEach(({ latGrid, x1, y1 }) => {
    strokeText(
      rad2string({ axis: 'NS', pad: 2, phi: latGrid }),
      x1 + 3,
      y1 - 3,
    );
  });
  pointsX.forEach(({ lonGrid, x1, y2 }) => {
    strokeText(
      rad2string({ axis: 'EW', pad: 3, phi: lonGrid }),
      x1 + 3,
      y2 - 3,
    );
  });
  context.fill();
  context.stroke();
};
