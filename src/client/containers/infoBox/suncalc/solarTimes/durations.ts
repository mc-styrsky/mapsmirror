import type { SolarDuration } from '../types/solarDuration';
import { add } from 'date-fns';
import { getPosition, getTimes } from 'suncalc';
import { halfDay } from '../../../../globals/halfDay';
import { intervalValueOf } from '../intervalValueOf';
import { SolarTimesStatics } from './statics';

export class SolarTimesDurations extends SolarTimesStatics {
  getDurations = ({ date }: { date: Date; }): SolarDuration => {
    const { dawn, dusk, nauticalDawn, nauticalDusk, night, nightEnd, solarNoon, sunrise, sunriseEnd, sunset, sunsetStart } = getTimes(date, this.lat, this.lon);
    const dayRaw = intervalValueOf({ end: sunsetStart, solarNoon, start: sunriseEnd });
    const isPolarDay = dayRaw === 0 && getPosition(solarNoon, this.lat, this.lon).altitude >= 0;
    return {
      astronomicalDawn: intervalValueOf({ end: nauticalDawn, solarNoon, start: nightEnd }),
      astronomicalDusk: intervalValueOf({ end: night, solarNoon, start: nauticalDusk }),
      civilDawn: intervalValueOf({ end: sunrise, solarNoon, start: dawn }),
      civilDusk: intervalValueOf({ end: dusk, solarNoon, start: sunset }),
      day: isPolarDay ? halfDay * 2 : dayRaw,
      nauticalDawn: intervalValueOf({ end: dawn, solarNoon, start: nauticalDawn }),
      nauticalDusk: intervalValueOf({ end: nauticalDusk, solarNoon, start: dusk }),
      sunrise: intervalValueOf({ end: sunriseEnd, solarNoon, start: sunrise }),
      sunset: intervalValueOf({ end: sunset, solarNoon, start: sunsetStart }),
    };
  };
  getDurationsStat = ({ year }: {
    year: number;
  }) => {
    let date = new Date(year, 0);
    const ret: SolarDuration[] = [];
    while (date.getFullYear() === year) {
      const durations = this.getDurations({ date });
      ret.push(durations);
      date = add(date, { hours: 24 });
    }
    return ret;
  };
}
