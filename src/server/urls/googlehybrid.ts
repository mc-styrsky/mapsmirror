import type { XYZ2Url } from './types';

export const xyz2googlehybrid: XYZ2Url = async (x, y, z) => {
  if (z > 20) return {};
  return {
    url: `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`,
  };
};
