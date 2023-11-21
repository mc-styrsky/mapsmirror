import type { XYZ2Url } from '../../common/types/xyz2url';
import { xyz2quadkey } from '../utils/xyz2quadkey';

export const xyz2bingsat: XYZ2Url = async (x, y, z) => {
  if (z > 20) return {};
  return {
    url: `https://t.ssl.ak.tiles.virtualearth.net/tiles/a${xyz2quadkey({ x, y, z })}.jpeg?g=14041&n=z&prx=1`,
  };
};
