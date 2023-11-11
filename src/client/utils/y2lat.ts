import { position } from '../index';

export const y2lat = (y: number, tiles = position.tiles) => Math.asin(Math.tanh((0.5 - y / tiles) * 2 * Math.PI));
