import type { XYZ2Url } from '../../common/types/xyz2url';

export const xyz2googlehybrid: XYZ2Url = async (x, y, z) => {
  if (z > 20) return {};
  if (z < 2) return {};
  return {
    url: `https://mt.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`,
  };
};
