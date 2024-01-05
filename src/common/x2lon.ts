import { PI2 } from './math';

export function x2lonCommon (x: number, tiles: number) {
  return (x / tiles - 0.5) * PI2;
}
