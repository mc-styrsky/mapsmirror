import type { Size } from '../../common/types/size';
import type { XYZ } from '../../common/types/xyz';
import { settings } from '../globals/settings';
import { tileSize } from '../globals/tileSize';
import { sphericCircle, sphericLatLon } from '../sphericCircle';
import { createHTMLElement } from '../utils/createHTMLElement';
import { frac } from '../utils/frac';
import { lat2y } from '../utils/lat2y';
import { lon2x } from '../utils/lon2x';
import { min2rad } from '../utils/min2rad';
import { nm2px } from '../utils/nm2px';
import { x2lon } from '../utils/x2lon';
import { y2lat } from '../utils/y2lat';

export const createCrosshairsCanvas = ({
  height,
  width,
  x,
  y,
}: Pick<XYZ, 'x' | 'y'> & Size) => {
  const canvas = createHTMLElement({
    height,
    style: {
      height: `${height}px`,
      position: 'absolute',
      width: `${width}px`,
    },
    tag: 'canvas',
    width,
  });
  const context = canvas.getContext('2d');
  if (!settings.crosshair.show || !context) return canvas;
  const lat = y2lat(y);
  const lon = x2lon(x);

  const milesPerTile = 100 / nm2px(lat);
  const scale = Math.log10(milesPerTile);
  const scaleFloor = Math.floor(scale);
  const scaleFrac = frac(scale);

  const milesPerArc = Math.pow(10, scaleFloor) * (scaleFrac < 0.3 ? 1 : scaleFrac > 0.7 ? 5 : 2);
  const milesPerDiv = milesPerArc / 10;

  context.translate(width / 2, height / 2);
  let minLast = 0;
  context.beginPath();
  context.strokeStyle = '#ff0000';
  context.moveTo(- 5, 5);
  context.lineTo(5, - 5);
  context.moveTo(5, 5);
  context.lineTo(- 5, - 5);
  context.stroke();
  for (let minArc = milesPerArc; minArc < 10800; minArc += milesPerArc) {
    const radiusX = nm2px(lat) * minArc;
    if (radiusX > canvas.width) break;

    const radDiv = min2rad(minArc);

    const circlePoints = sphericCircle(lat, lon, radDiv).map(([latPoint, lonPoint, draw]) => ({
      draw,
      tx: (lon2x(lonPoint) - x) * tileSize,
      ty: (lat2y(latPoint) - y) * tileSize,
    }));
    context.beginPath();
    context.strokeStyle = '#ff0000';
    circlePoints
    .forEach(({ draw, tx, ty }, idx) => {
      if (draw) context.lineTo(tx, ty);
      else context.moveTo(tx, ty);
      if (idx === 32) context.strokeText(`${minArc.toFixed(Math.max(0, -scaleFloor))}nm`, tx, ty);
    });
    context.stroke();

    const piHalf = Math.PI / 2;

    context.beginPath();

    for (let minDiv = minLast + milesPerDiv; minDiv < minArc; minDiv += milesPerDiv) {
      const radDiv = min2rad(minDiv);
      if (lat + radDiv < piHalf) {
        const top = (lat2y(lat + radDiv) - y) * tileSize;
        context.moveTo(- 5, top);
        context.lineTo(5, top);
      }
      if (lat - radDiv > - piHalf) {
        const bottom = (lat2y(lat - radDiv) - y) * tileSize;
        context.moveTo(- 5, bottom);
        context.lineTo(5, bottom);
      }
      const { cosOmega2, lat2, lon2 } = sphericLatLon({ lat, omega: piHalf, radius: radDiv });
      const sinOmega2 = Math.sqrt(1 - cosOmega2 * cosOmega2);


      context.moveTo(
        (lon2x(lon + lon2) - x) * tileSize + cosOmega2 * 5,
        (lat2y(lat2) - y) * tileSize - sinOmega2 * 5,
      );
      context.lineTo(
        (lon2x(lon + lon2) - x) * tileSize - cosOmega2 * 5,
        (lat2y(lat2) - y) * tileSize + sinOmega2 * 5,
      );
      context.moveTo(
        (lon2x(lon - lon2) - x) * tileSize - cosOmega2 * 5,
        (lat2y(lat2) - y) * tileSize - sinOmega2 * 5,
      );
      context.lineTo(
        (lon2x(lon - lon2) - x) * tileSize + cosOmega2 * 5,
        (lat2y(lat2) - y) * tileSize + sinOmega2 * 5,
      );

      context.strokeStyle = '#ff0000';
    }
    context.stroke();
    minLast = minArc;
  }
  return canvas;
};
