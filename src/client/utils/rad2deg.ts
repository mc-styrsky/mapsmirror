import { units } from '../globals/units';

type CoordsParams = {phi: number, pad: number, axis: string};
const func: Record<typeof units.coords, (CoordsParams) => string> = {
  d: ({ axis = ' -', pad = 0, phi }) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 100000) / 100000;
    while (deg > 180) deg -= 360;
    while (deg < -180) deg += 360;

    return `${
      axis[deg < 0 ? 1 : 0] ?? ''
    }${
      (deg < 0 ? - deg : deg).toFixed(5).padStart(pad + 6, '0')
    }°`;
  },
  dm: ({ axis = ' -', pad = 0, phi }: CoordsParams) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 60000) / 60000;
    while (deg > 180) deg -= 360;
    while (deg < -180) deg += 360;
    const degrees = deg | 0;
    const minutes = (Math.abs(deg) - Math.abs(degrees)) * 60;

    return `${
      axis[deg < 0 ? 1 : 0] ?? ''
    }${
      (deg < 0 ? - degrees : degrees).toFixed(0).padStart(pad, '0')
    }°${
      minutes.toFixed(3).padStart(6, '0')
    }'`;
  },
  dms: ({ axis = ' -', pad = 0, phi }: CoordsParams) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 360000) / 360000;
    while (deg > 180) deg -= 360;
    while (deg < -180) deg += 360;
    const degrees = deg | 0;
    const min = Math.round((Math.abs(deg) - Math.abs(degrees)) * 360000) / 6000;
    const minutes = min | 0;
    const seconds = (min - minutes) * 60;

    return `${
      axis[deg < 0 ? 1 : 0] ?? ''
    }${
      (deg < 0 ? - degrees : degrees).toFixed(0).padStart(pad, '0')
    }°${
      minutes.toFixed(0).padStart(2, '0')
    }'${
      seconds.toFixed(2).padStart(5, '0')
    }"`;
  },
};

export const rad2deg = ({ axis = ' -', pad = 0, phi }: CoordsParams) => func[units.coords]({ axis, pad, phi });
