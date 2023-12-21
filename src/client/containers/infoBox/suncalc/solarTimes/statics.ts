import type { DurationKeys } from '../types/durationKeys';
import type { SolarDuration } from '../types/solarDuration';
import { format } from 'date-fns';
import { halfDay } from '../../../../globals/halfDay';
import { Container } from '../../../container';

export class SolarTimesStatics {
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
  .reduce((ret: (Container<any> | string)[], { end, start }, idx) => {
    if (idx !== 0) ret.push(Container.from('br'));
    ret.push(start.valueOf() === end.valueOf() ?
      format(start, 'dd.MM.yyyy') :
      `${format(start, 'dd.MM.yyyy')} - ${format(end, 'dd.MM.yyyy')}`,
    );
    return ret;
  }, []);
}
