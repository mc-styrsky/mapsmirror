import type { LatLon } from './latLon';
import { asin, atan2, cos, max, min, sin, sqrt } from '../../../common/math';
import { nm2rad } from '../min2rad';

// http://www.movable-type.co.uk/scripts/latlong.html
export function radiusOmega2LatLon ({ cosLat, cosZeta, lat, lon, omega, radius, sinLat, sinZeta, zeta }: LatLon & {
  omega: number;
  sinZeta?: number;
  cosZeta?: number;
  sinLat?: number;
  cosLat?: number;
} & ({
  zeta: number;
  radius?: number;
} | {
  zeta?: undefined;
  radius: number;
})) {
  zeta ??= nm2rad(radius);
  sinZeta ??= sin(zeta);
  cosZeta ??= cos(zeta);
  sinLat ??= sin(lat);
  cosLat ??= cos(lat);


  const sinLat2 = max(-1, min(cos(omega) * cosLat * sinZeta + sinLat * cosZeta, 1));
  const lat2 = asin(sinLat2);
  const cosLat2 = sqrt(1 - sinLat2 * sinLat2);
  const lon2 = lon + atan2(
    sin(omega) * sinZeta * cosLat,
    cosZeta - sinLat * sinLat2);

  const cosOmega2 = (sinLat - sinLat2 * cosZeta) / (cosLat2 * sinZeta);
  return { cosOmega2, lat2, lon2 };
}
