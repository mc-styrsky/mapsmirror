import type { XYZ2Url } from '../../common/types/xyz2url';
import { worthItMinMax } from '../utils/worthit';

export const xyz2opentopomap: XYZ2Url = async (x, y, z) => {
  if (z > 17) return {};
  if (z < 2) return {};
  return {
    url: `https://tile.opentopomap.org/${z}/${x}/${y}.png`,
    worthIt: async ({ x, y, z }) => {
      const res = await worthItMinMax({ x, y, z });
      if (!res) return false;
      const { max, min } = res;
      return max > 126 && min < 144;
    },

  };
};
