import type { XYZ2Url } from './types';

export const xyz2googlestreet: XYZ2Url = async (x, y, z) => {
  if (z > 20) return {};
  return {
    url: `https://mt.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`,
  };
};