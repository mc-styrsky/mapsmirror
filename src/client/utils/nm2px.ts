import { tileSize } from '../index';
import { position } from '../position';

export const nm2px = (lat: number) => {
  const stretch = 1 / Math.cos(lat);
  return position.tiles * tileSize / 360 / 60 * stretch;
};
