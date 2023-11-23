import type { XYZ2Url } from '../../common/types/xyz2url';

export const xyz2osm: XYZ2Url = async (x, y, z) => {
  if (z > 20) return {};
  return {
    url: `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  };
};
