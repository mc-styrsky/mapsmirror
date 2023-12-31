import { PI, abs, modulo, round } from '../../common/math';
import { Settings } from '../globals/settings';

const rad2ModuloDeg = (phi: number) => modulo(phi * 180 / PI + 180, 360) - 180;

type Axis = ' -' | 'NS' | 'EW'
interface CoordsParams {phi: number, pad: number, axis: Axis}
export const rad2stringFuncs: Record<typeof Settings.units.coords, (params: CoordsParams) => string> = {
  d: ({ axis = ' -', pad = 0, phi }) => {
    const deg = round(rad2ModuloDeg(phi) * 100000) / 100000;

    return `${
      axis[deg < 0 ? 1 : 0] ?? ''
    }${
      (deg < 0 ? - deg : deg).toFixed(5).padStart(pad + 6, '0')
    }°`;
  },
  dm: ({ axis = ' -', pad = 0, phi }: CoordsParams) => {
    const deg = round(rad2ModuloDeg(phi) * 60000) / 60000;
    const degrees = deg | 0;
    const minutes = (abs(deg) - abs(degrees)) * 60;

    return `${
      axis[deg < 0 ? 1 : 0] ?? ''
    }${
      (deg < 0 ? - degrees : degrees).toFixed(0).padStart(pad, '0')
    }°${
      minutes.toFixed(3).padStart(6, '0')
    }`;
  },
  dms: ({ axis = ' -', pad = 0, phi }: CoordsParams) => {
    const deg = round(rad2ModuloDeg(phi) * 360000) / 360000;
    const degrees = deg | 0;
    const min = round((abs(deg) - abs(degrees)) * 360000) / 6000;
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
    }`;
  },
};

export function rad2string ({ axis = ' -', pad = 0, phi }: CoordsParams) {
  return rad2stringFuncs[Settings.units.coords]({ axis, pad, phi });
}
