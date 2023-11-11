import { position, tileSize } from '../index';


export const px2nm = (lat: number) => {
  const stretch = 1 / Math.cos(lat);
  return 360 * 60 / position.tiles / tileSize / stretch;
};
