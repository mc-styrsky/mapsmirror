import type { AddDuration } from './types/addDuration';
import type { AddIncrement } from './types/addIncrement';
import type { DurationKeys } from './types/durationKeys';
import { formatDateValue } from '../../../utils/formatDateValue';
import { Container } from '../../../utils/htmlElements/container';
import { SolarTimesStatics } from './solarTimes/statics';
import { SolarTimesStatsCanvas } from './solarTimesStatsCanvas';

export class ValueRow {
  lines: Container[] = [];
  total = 0;
  totalKeys: DurationKeys[] = [];
  fill = (label: string, sum: number) => this.add({
    increment: sum - this.total,
    label,
  });
  fillStats = (durations:AddDuration['durations'], sum: number) => this.addStats({
    durations,
    keys: this.totalKeys,
    map: (val) => sum - val,
  });
  add ({ durations, keys, label }: AddDuration): ValueRow
  add ({ increment, label }: AddIncrement): ValueRow
  add ({ durations, increment, keys, label }: AddDuration | AddIncrement): ValueRow {
    increment ??= SolarTimesStatics.increment({
      durations: durations.today,
      keys,
    }),

    this.total += increment;

    this.addRow({
      col1: [label],
      col2: [increment ? `+${formatDateValue(increment)}` : ''],
      col3: [formatDateValue(this.total)],
    });

    if (durations) this.addStats({ durations, keys });

    return this;
  }
  addRow ({ col1, col2, col3 }: Partial<Record<'col1'|'col2'|'col3', (string|Container<HTMLElement>)[]>>): ValueRow
  addRow ({ row }: {row: (string|Container<HTMLElement>)[]}): ValueRow
  addRow ({ col1 = [], col2 = [], col3 = [], row }: Partial<Record<'col1'|'col2'|'col3'|'row', (string|Container<HTMLElement>)[]>>) {
    row ??= [
      Container.from('div', {
        style: { marginRight: 'auto' },
      }).append(...col1),
      Container.from('div', {
        classes: ['text-end'],
        style: { width: '5em' },
      }).append(...col2),
      Container.from('div', {
        classes: ['text-end'],
        style: { width: '5em' },
      }).append(...col3),
    ];
    this.lines.push(Container.from('div', {
      classes: ['d-flex'],
    }).append(...row));
    return this;
  }
  addStats ({ durations, keys, map }: Pick<AddDuration, 'durations' | 'keys'> & {map?: (val: number) => number}) {
    const stats = new SolarTimesStatsCanvas({
      height: 30,
      keys,
      map,
      params: {
        style: {
          backgroundColor: '#ffffff',
          height: '30px',
          width: '15em',
        },
      },
      stats: durations.stats,
      width: 15 * 16,
    });
    const axis = [stats.max, stats.min].map(v => Container.from('div', {
      classes: ['text-end'],
      style: {
        fontSize: '10px',
      },
    }).append(formatDateValue(v)));
    this.addRow({
      row: [
        Container.from('div', {
          style: {
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            borderRight: '1px solid',
            marginLeft: 'auto',
            paddingLeft: '3px',
            paddingRight: '3px',
          },
        })
        .append(...axis),
        stats,
      ],
    });

    this.totalKeys.push(...keys);
    return this;
  }
}
