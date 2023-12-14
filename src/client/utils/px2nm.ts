import { position } from '../globals/position';
import { tileSize } from '../globals/tileSize';


export const px2nm = (lat: number) => {
  const stretch = 1 / Math.cos(lat);
  console.log({ stretch });
  return 360 * 60 / position.tiles / tileSize / stretch;
};
