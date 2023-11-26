import { position } from '../globals/position';
import { tileSize } from '../index';

export const nm2px = (lat: number) => {
  const stretch = 1 / Math.cos(lat);
  return position.tiles * tileSize / 360 / 60 * stretch;
};
