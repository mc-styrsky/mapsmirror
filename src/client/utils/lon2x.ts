import { position } from '../index';

export const lon2x = (lon: number, tiles = position.tiles) => (lon / Math.PI / 2 + 0.5) * tiles;
