import { position } from '../globals/position';

export const x2lon = (x: number, tiles = position.tiles) => (x / tiles - 0.5) * Math.PI * 2;
