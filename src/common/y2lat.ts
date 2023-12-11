export const y2latCommon = (y: number, tiles: number) => Math.asin(Math.tanh((0.5 - y / tiles) * 2 * Math.PI));
