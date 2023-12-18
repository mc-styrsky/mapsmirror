export function modulo (val: number, mod: number) {
  const ret = val % mod;
  return ret < 0 ? ret + mod : ret;
}
