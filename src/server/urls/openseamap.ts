import type { XYZ2Url } from '../../common/types/xyz2url';

export const xyz2openseamap: XYZ2Url = async (x, y, z) => {
  if (z > 18) return {};
  return {
    url: `https://tiles.openseamap.org/seamark/${z}/${x}/${y}.png`,
  };
};
