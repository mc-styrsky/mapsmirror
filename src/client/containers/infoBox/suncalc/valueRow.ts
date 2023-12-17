import type { AddDuration } from './types/AddDuration';
import type { AddIncrement } from './types/AddIncrement';
import type { DurationKeys } from './types/DurationKeys';
import { createHTMLElement } from '../../../utils/createHTMLElement';
import { formatDateValue } from '../../../utils/formatDateValue';
import { SolarTimesStatics } from './solarTimes/statics';
import { SolarTimesStatsCanvas } from './solarTimesStatsCanvas';

export class ValueRow {
  lines: HTMLElement[] = [];
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
  addRow ({ col1, col2, col3 }: Partial<Record<'col1'|'col2'|'col3', (string|HTMLElement)[]>>): ValueRow
  addRow ({ row }: {row: (string|HTMLElement)[]}): ValueRow
  addRow ({ col1, col2, col3, row }: Partial<Record<'col1'|'col2'|'col3'|'row', (string|HTMLElement)[]>>) {
    row ??= [
      createHTMLElement({
        style: { marginRight: 'auto' },
        tag: 'div',
        zhilds: col1,
      }),
      createHTMLElement({
        classes: ['text-end'],
        style: { width: '5em' },
        tag: 'div',
        zhilds: col2,
      }),
      createHTMLElement({
        classes: ['text-end'],
        style: { width: '5em' },
        tag: 'div',
        zhilds: col3,
      }),
    ];
    this.lines.push(createHTMLElement({
      classes: ['d-flex'],
      tag: 'div',
      zhilds: row,
    }));
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
    const axis = [stats.max, stats.min].map(v => createHTMLElement({
      classes: ['text-end'],
      style: {
        fontSize: '10px',
      },
      tag: 'div',
      zhilds: [formatDateValue(v)],
    }));
    this.addRow({ row: [
      createHTMLElement({
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          borderRight: '1px solid',
          marginLeft: 'auto',
          paddingLeft: '3px',
          paddingRight: '3px',
        },
        tag: 'div',
        zhilds: axis,
      }),
      stats.canvas,
    ] });

    this.totalKeys.push(...keys);
    return this;
  }
}
