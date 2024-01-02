import type { LatLon } from './latLon';
import type { RadiusOmega } from './radiusOmega';
import { acos, atan2, cos, sin } from '../../../common/math';
import { rad2nm } from '../rad2nm';

// http://www.movable-type.co.uk/scripts/latlong.html
export function latLon2RadiusOmega ({ from, to }: {
  from: LatLon;
  to: LatLon;
}): RadiusOmega {
  const dLon = to.lon - from.lon;

  const zeta = acos(sin(from.lat) * sin(to.lat) + cos(from.lat) * cos(to.lat) * cos(dLon));
  const omega = atan2(
    sin(dLon) * cos(to.lat),
    cos(from.lat) * sin(to.lat) - sin(from.lat) * cos(to.lat) * cos(dLon),
  );
  const radius = rad2nm(zeta);
  return { omega, radius };
}
