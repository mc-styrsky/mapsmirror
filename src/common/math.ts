export const { abs, acos, asin, asinh, atan2, ceil, cos, floor, log2, log10, max, min, PI, pow, round, sin, sqrt, tan, tanh } = Math;

export const PI2 = PI * 2;
export const PIhalf = PI / 2;

export function frac (x: number) {
  return x - floor(x);
}

export function modulo (val: number, mod: number) {
  const ret = val % mod;
  return ret < 0 ? ret + mod : ret;
}
