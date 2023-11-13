import { tileSize } from './index';
import { position } from './position';
import { sphericCircle, sphericLatLon } from './sphericCircle';
import { frac } from './utils/frac';
import { lat2y } from './utils/lat2y';
import { lon2x } from './utils/lon2x';
import { min2rad } from './utils/min2rad';
import { nm2px } from './utils/nm2px';
import { x2lon } from './utils/x2lon';
import { y2lat } from './utils/y2lat';

export const crosshairs = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
  const lat = y2lat(position.y);
  const lon = x2lon(position.x);

  const milesPerTile = 100 / nm2px(lat);
  const scale = Math.log10(milesPerTile);
  const scaleFloor = Math.floor(scale);
  const scaleFrac = frac(scale);

  const milesPerArc = Math.pow(10, scaleFloor) * (scaleFrac < 0.3 ? 1 : scaleFrac > 0.7 ? 5 : 2);
  const milesPerDiv = milesPerArc / 10;

  const center = {
    x: position.x * tileSize,
    y: position.y * tileSize,
  };
  let minLast = 0;
  context.beginPath();
  context.strokeStyle = '#ff0000';
  context.moveTo(center.x - 5, center.y + 5);
  context.lineTo(center.x + 5, center.y - 5);
  context.moveTo(center.x + 5, center.y + 5);
  context.lineTo(center.x - 5, center.y - 5);
  context.stroke();
  for (let minArc = milesPerArc; minArc < milesPerArc * 100; minArc += milesPerArc) {
    if (minArc > 10800) break;
    const radiusX = nm2px(lat) * minArc;
    if (radiusX > canvas.width) break;

    const radDiv = min2rad(minArc);

    const circlePoints = sphericCircle(lat, lon, radDiv).map(([latPoint, lonPoint, draw]) => {
      const ret = [
        lon2x(lonPoint) * tileSize,
        lat2y(latPoint) * tileSize,
        draw,
      ] as [number, number, boolean];

      return ret;
    });
    context.beginPath();
    context.strokeStyle = '#ff0000';
    circlePoints.forEach(([pointX, pointY, draw], idx) => {
      if (draw) context.lineTo(pointX, pointY);
      else context.moveTo(pointX, pointY);
      if (idx === 32) context.strokeText(`${minArc.toFixed(Math.max(0, -scaleFloor))}nm`, pointX, pointY);
    });
    context.stroke();

    const piHalf = Math.PI / 2;

    context.beginPath();

    for (let minDiv = minLast + milesPerDiv; minDiv < minArc; minDiv += milesPerDiv) {
      const radDiv = min2rad(minDiv);
      if (lat + radDiv < piHalf) {
        const top = lat2y(lat + radDiv) * tileSize;
        context.moveTo(center.x - 5, top);
        context.lineTo(center.x + 5, top);
      }
      if (lat - radDiv > - piHalf) {
        const bottom = lat2y(lat - radDiv) * tileSize;
        context.moveTo(center.x - 5, bottom);
        context.lineTo(center.x + 5, bottom);
      }
      const { cosOmega2, lat2, lon2 } = sphericLatLon({ lat, omega: piHalf, radius: radDiv });
      const sinOmega2 = Math.sqrt(1 - cosOmega2 * cosOmega2);


      context.moveTo(lon2x(lon + lon2) * tileSize + cosOmega2 * 5, lat2y(lat2) * tileSize - sinOmega2 * 5);
      context.lineTo(lon2x(lon + lon2) * tileSize - cosOmega2 * 5, lat2y(lat2) * tileSize + sinOmega2 * 5);
      context.moveTo(lon2x(lon - lon2) * tileSize - cosOmega2 * 5, lat2y(lat2) * tileSize - sinOmega2 * 5);
      context.lineTo(lon2x(lon - lon2) * tileSize + cosOmega2 * 5, lat2y(lat2) * tileSize + sinOmega2 * 5);

      context.strokeStyle = '#ff0000';
    }
    context.stroke();
    minLast = minArc;
  }
};
