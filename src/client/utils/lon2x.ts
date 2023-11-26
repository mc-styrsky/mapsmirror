import { position } from '../globals/position';

export const lon2x = (lon: number, tiles = position.tiles) => (lon / Math.PI / 2 + 0.5) * tiles;
