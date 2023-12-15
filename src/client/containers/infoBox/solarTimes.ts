import type { DurationKeys } from './types/DurationKeys';
import type { SolarDuration } from './types/SolarDuration';
import { add } from 'date-fns';
import { getTimes } from 'suncalc';
import { position } from '../../globals/position';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { halfDay } from '../../utils/halfDay';
import { rad2deg } from '../../utils/rad2deg';
import { x2lon } from '../../utils/x2lon';
import { y2lat } from '../../utils/y2lat';
import { intervalValueOf } from './intervalValueOf';
import { ValueRow } from './valueRow';

export class SolarTimes {
  x = -1;
  y = -1;
  lat = 0;
  lon = 0;
  getDurations = ({ date }: {date: Date}): SolarDuration => {
    const { dawn, dusk, nauticalDawn, nauticalDusk, night, nightEnd, solarNoon, sunrise, sunriseEnd, sunset, sunsetStart } = getTimes(date, this.lat, this.lon);
    return {
      astronomicalDawn: intervalValueOf({ end: nauticalDawn, solarNoon, start: nightEnd }),
      astronomicalDusk: intervalValueOf({ end: night, solarNoon, start: nauticalDusk }),
      civilDawn: intervalValueOf({ end: sunrise, solarNoon, start: dawn }),
      civilDusk: intervalValueOf({ end: dusk, solarNoon, start: sunset }),
      day: intervalValueOf({ end: sunsetStart, solarNoon, start: sunriseEnd }),
      nauticalDawn: intervalValueOf({ end: dawn, solarNoon, start: nauticalDawn }),
      nauticalDusk: intervalValueOf({ end: nauticalDusk, solarNoon, start: dusk }),
      sunrise: intervalValueOf({ end: sunriseEnd, solarNoon, start: sunrise }),
      sunset: intervalValueOf({ end: sunset, solarNoon, start: sunsetStart }),
    };
  };
  getDurationsStat = ({ func, keys, year }: {
    func: 'min'|'max'
    keys: DurationKeys[],
    year: number,
  }) => {
    let date = new Date(Date.UTC(year));
    const ret = {
      date,
      durations: this.getDurations({ date }),
      increment: 0,
    };
    while (date.getUTCFullYear() === year) {
      date = add(date, { hours: 24 });
      const durations = this.getDurations({ date });
      const increment = SolarTimes.increment({ durations, keys });
      if (Math[func](increment, ret.increment) === increment) {
        Object.assign(ret, {
          date,
          durations,
          increment,
        });
        console.log({ ret });
      }
    }
    return ret;
  };
  static increment = ({ durations, keys }: {
    durations: SolarDuration
    keys: DurationKeys[]
  }) => keys.reduce((sum, key) => sum + durations[key], 0);
  private html: HTMLElement | null = null;
  toHtml = () => {
    if (this.x !== position.x || this.y !== position.y) {
      this.x = position.x;
      this.y = position.y;
      this.lat = rad2deg(y2lat(this.y));
      this.lon = rad2deg(x2lon(this.x));
      this.html = null;
    }
    if (!this.html) {
      const durations = {
        stats: this.getDurationsStat({
          func: 'min',
          keys: ['day', 'sunrise', 'sunset'],
          year: new Date().getFullYear(),
        }),
        today: this.getDurations({ date: new Date() }),
      };
      console.log(durations);
      // const { astronomicalDawn, astronomicalDusk, civilDawn, civilDusk, day, nauticalDawn, nauticalDusk, sunrise, sunset } = durations;
      const zhilds = new ValueRow()
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
      .add({
        durations,
        keys: ['astronomicalDawn', 'astronomicalDusk'],
        label: 'Astro. Twilight',
      })
      .fill('Night', halfDay * 2)
      .lines;
      this.html = createHTMLElement({
        tag: 'div',
        zhilds,
      });
    }
    return this.html;
  };
}

export const solarTimes = new SolarTimes();
