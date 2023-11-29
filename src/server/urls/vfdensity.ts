import type { XYZ2Url } from '../../common/types/xyz2url';

export const xyz2vfdensity: XYZ2Url = async (x, y, z) => {
  if (z > 12) return {};
  if (z < 3) return {};
  return {
    url: `https://density.tiles.vesselfinder.net/all/${z}/${x}/${y}.png`,
  };
};
