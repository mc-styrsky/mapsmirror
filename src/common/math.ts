export const { abs, acos, asin, asinh, atan2, ceil, cos, floor, log2, log10, max, min, PI, pow, round, sin, sqrt, tan, tanh } = Math;

export const PI2 = 2 * PI;
export const piHalf = PI / 2;

export function frac (x: number) {
  return x - floor(x);
}
