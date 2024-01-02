import { x2lon } from './x2lon';
import { y2lat } from './y2lat';

export function xyz2latLon ({ x, y, z }) {
  return {
    lat: y2lat(y, 1 << z),
    lon: x2lon(x, 1 << z),
  };
}
