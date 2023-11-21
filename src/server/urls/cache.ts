import type { XYZ2Url } from '../../common/types/types';

export const xyz2cache: XYZ2Url = async (x, y, z) => {
  if (z > 9) return {};
  return {
    local: true,
    url: `./cache/tiles/${z}/${x}/${y}.png`,
  };
};
