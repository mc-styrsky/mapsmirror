import { halfDay } from '../../../globals/halfDay';
import { position } from '../../../globals/position';
import { rad2deg } from '../../../utils/rad2deg';
import { x2lon } from '../../../utils/x2lon';
import { y2lat } from '../../../utils/y2lat';
import { SolarTimesDurations } from './solarTimes/durations';
import { ValueRow } from './valueRow';

class SolarTimes extends SolarTimesDurations {
  refresh = () => {
    if (this.x !== position.x || this.y !== position.y) {
      this.x = position.x;
      this.y = position.y;
      this.lat = rad2deg(y2lat(this.y));
      this.lon = rad2deg(x2lon(this.x));
      this.clear();
    }
    const date = new Date();
    if (!this.html) {
      const durations = {
        stats: this.getDurationsStat({
          year: date.getFullYear(),
        }),
        today: this.getDurations({ date }),
      };
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
      // .add({
      //   durations,
      //   keys: ['astronomicalDawn', 'astronomicalDusk'],
      //   label: 'Astro. Twilight',
      // })
      .fill('Night', halfDay * 2)
      .fillStats(durations, halfDay * 2)
      .lines;
      this.append(...zhilds);
    }
  };
}

export const solarTimes = new SolarTimes();
