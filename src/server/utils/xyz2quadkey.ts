import type { XYZ } from '../../common/types/xyz';

export const xyz2quadkey = ({ x, y, z }: XYZ) => {
  return (parseInt(y.toString(2), 4) * 2 + parseInt(x.toString(2), 4)).toString(4).padStart(z, '0');
};
