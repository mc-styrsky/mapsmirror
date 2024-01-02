import { PI2 } from '../../common/math';

export function rad2nm (val: number) {
  return Number(val) * 21600 / PI2;
}
