import { PI2, abs, cos, sin } from '../../../common/math';
import { radiusOmega2LatLon } from '../../utils/spheric/radiusOmega2LatLon';

export type CirclePoints = [number, number, boolean];

export function sphericCircle ({ lat, lon, steps = 256, zeta }: { lat: number; lon: number; zeta: number; steps?: number; }): CirclePoints[] {
  const sinZeta = sin(zeta);
  const cosZeta = cos(zeta);
  const sinLat = sin(lat);
  const cosLat = cos(lat);

  const points: CirclePoints[] = [];
  for (let step = 0; step <= steps; step++) {
    const omega = step / steps * PI2;
    const { lat2, lon2 } = radiusOmega2LatLon({ cosLat, cosZeta, lat, lon, omega, sinLat, sinZeta, zeta });
    if (step === 0) points.push([lat2, lon + abs(lon2 - lon), false]);
    else if (step === steps / 2) {
      points.push([lat2, lon + abs(lon2 - lon), true]);
      points.push([lat2, lon - abs(lon2 - lon), false]);
    }
    else if (step === steps) points.push([lat2, lon - abs(lon2 - lon), true]);
    else points.push([lat2, lon2, true]);
  }
  return points;
}
