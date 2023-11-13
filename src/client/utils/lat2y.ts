import { position } from '../position';

export const lat2y = (lat: number, tiles = position.tiles) => {
  return (0.5 - Math.asinh(Math.tan(lat)) / Math.PI / 2) * tiles;
};
