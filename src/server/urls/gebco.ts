import type { XYZ2Url } from './types';

export const xyz2gebco: XYZ2Url = async (x, y, z) => {
  if (z > 9) return {};
  return {
    local: true,
    url: `./gebco/tiles/${z}/${x}/${y}.png`,
  };
};
