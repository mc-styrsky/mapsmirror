import type { XYZ2Url } from '../../common/types/xyz2url';

export const xyz2cache: XYZ2Url = async (x, y, z) => {
  if (z > 9) return {};
  if (z < 2) return {};
  return {
    local: true,
    url: `./cache/tiles/${z}/${x}/${y}.png`,
  };
};
