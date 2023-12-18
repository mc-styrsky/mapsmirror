export function y2latCommon (y: number, tiles: number) {
  return Math.asin(Math.tanh((0.5 - y / tiles) * 2 * Math.PI));
}
