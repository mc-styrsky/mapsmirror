import type { SolarDuration } from './types/solarDuration';
import { add } from 'date-fns';
import { getPosition, getTimes } from 'suncalc';
import { halfDay } from '../../../globals/halfDay';
import { position } from '../../../globals/position';
import { Container } from '../../../utils/htmlElements/container';
import { MonoContainer } from '../../../utils/htmlElements/monoContainer';
import { rad2deg } from '../../../utils/rad2deg';
import { x2lon } from '../../../utils/x2lon';
import { y2lat } from '../../../utils/y2lat';
import { intervalValueOf } from './intervalValueOf';
import { ValueRow } from './valueRow';

export class SolarTimes extends MonoContainer {
  static {
    this.copyInstance(new Container('div'), this);
    this.html.id = 'SolarTimes';
  }
  static lat = 0;
  static lon = 0;
  static x = -1;
  static y = -1;

  private static getDurations = ({ date }: { date: Date; }): SolarDuration => {
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
  private static getDurationsStat = ({ year }: {
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
  static refresh = () => {
    if (this.x !== position.x || this.y !== position.y) {
      this.x = position.x;
      this.y = position.y;
      this.lat = rad2deg(y2lat(this.y));
      this.lon = rad2deg(x2lon(this.x));
      this.clear();

      const date = new Date();
      const durations = {
        stats: this.getDurationsStat({
          year: date.getFullYear(),
        }),
        today: this.getDurations({ date }),
      };

      this.append(
        new ValueRow()
        .add({
          durations,
          keys: ['day'],
          label: 'Day',
        })
        .add({
          durations,
          keys: ['sunrise', 'sunset'],
          label: 'Sunrise/set',
        })
        .add({
          durations,
          keys: ['civilDawn', 'civilDusk'],
          label: 'Twilight',
        })
        .add({
          durations,
          keys: ['nauticalDawn', 'nauticalDusk'],
          label: 'Naut. Twilight',
        })
        // .add({
        //   durations,
        //   keys: ['astronomicalDawn', 'astronomicalDusk'],
        //   label: 'Astro. Twilight',
        // })
        .fill('Night', halfDay * 2)
        .fillStats(durations, halfDay * 2),
      );
    }
  };
}
