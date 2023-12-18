import { position } from '../globals/position';

export function lon2x (lon: number, tiles = position.tiles) {
  return (lon / Math.PI / 2 + 0.5) * tiles;
}
