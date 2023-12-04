import type { XYZ2Url } from '../../common/types/xyz2url';

export const xyz2opentopomap: XYZ2Url = async (x, y, z) => {
  if (z > 17) return {};
  return {
    url: `https://tile.opentopomap.org/${z}/${x}/${y}.png`,
  };
};
