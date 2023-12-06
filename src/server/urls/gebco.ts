import type { XYZ2Url } from '../../common/types/xyz2url';

export const xyz2gebco: XYZ2Url = async (x, y, z) => {
  if (z > 9) return {};
  if (z < 2) return {};
  return {
    local: true,
    url: `./gebco/tiles/${z}/${x}/${y}.png`,
  };
};
