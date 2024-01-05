import { PI2, asin, tanh } from './math';

export function y2latCommon (y: number, tiles: number) {
  return asin(tanh((0.5 - y / tiles) * PI2));
}
