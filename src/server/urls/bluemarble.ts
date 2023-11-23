import type { XYZ2Url } from '../../common/types/xyz2url';

export const xyz2bluemarble: XYZ2Url = async (x, y, z) => {
  if (z > 9) return {};
  return {
    url: `https://s3.amazonaws.com/com.modestmaps.bluemarble/${z}-r${y}-c${x}.jpg`,
  };
};
