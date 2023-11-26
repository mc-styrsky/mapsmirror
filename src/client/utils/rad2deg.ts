import { units } from '../globals/units';

type CoordsParams = {phi: number, pad: number, axis: string};
const func = {
  decimal: ({ axis = ' -', pad = 0, phi }: CoordsParams) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 100000) / 100000;
    while (deg > 180) deg -= 360;
    while (deg < -180) deg += 360;

    return `${
      axis[deg < 0 ? 1 : 0] ?? ''
    }${
      (deg < 0 ? - deg : deg).toFixed(5).padStart(pad + 6, '0')
    }°`;
  },
  minutes: ({ axis = ' -', pad = 0, phi }: CoordsParams) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 60000) / 60000;
    while (deg > 180) deg -= 360;
    while (deg < -180) deg += 360;
    const degrees = deg | 0;
    const minutes = (Math.abs(deg) - Math.abs(degrees)) * 60;

    return `${
      axis[deg < 0 ? 1 : 0] ?? ''
    }${
      (deg < 0 ? - degrees : degrees).toFixed(0).padStart(pad, '0')
    }° ${
      minutes.toFixed(3).padStart(6, '0')
    }'`;
  } };

export const rad2deg = ({ axis = ' -', pad = 0, phi }: CoordsParams) => func[units.coords]({ axis, pad, phi });
