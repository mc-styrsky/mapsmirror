import type { DurationKeys } from './types/durationKeys';
import type { SolarDuration } from './types/solarDuration';
import { add, format } from 'date-fns';
import { getPosition, getTimes } from 'suncalc';
import { halfDay } from '../../../globals/halfDay';
import { position } from '../../../globals/position';
import { Container } from '../../../utils/htmlElements/container';
import { rad2deg } from '../../../utils/rad2deg';
import { x2lon } from '../../../utils/x2lon';
import { y2lat } from '../../../utils/y2lat';
import { intervalValueOf } from './intervalValueOf';
import { ValueRow } from './valueRow';

export class SolarTimes extends Container {
  constructor () {
    super();
    this.html.id = 'SolarTimes';
  }
  lat = 0;
  lon = 0;
  x = -1;
  y = -1;
  static increment = ({ durations, keys }: {
    durations: SolarDuration;
    keys: DurationKeys[];
  }) => keys.reduce((sum, key) => sum + durations[key], 0);

  static formatDates = (dates: Date[]) => dates
  .sort((a, b) => a.valueOf() - b.valueOf())
  .reduce((ret: { start: Date; end: Date; }[], date) => {
    const { end = date, start = date } = ret.pop() ?? {};
    if (date.valueOf() - end.valueOf() <= halfDay * 2) ret.push({ end: date, start });
    else {
      ret.push({ end, start });
      ret.push({ end: date, start: date });
    }
    return ret;
  }, [])
  .reduce((ret: (Container<HTMLElement> | string)[], { end, start }, idx) => {
    if (idx !== 0) ret.push(Container.from('br'));
    ret.push(start.valueOf() === end.valueOf() ?
      format(start, 'dd.MM.yyyy') :
      `${format(start, 'dd.MM.yyyy')} - ${format(end, 'dd.MM.yyyy')}`,
    );
    return ret;
  }, []);

  private getDurations = ({ date }: { date: Date; }): SolarDuration => {
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
  private getDurationsStat = ({ year }: {
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
  refresh = () => {
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

export const solarTimes = new SolarTimes();
