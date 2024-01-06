import type { AddDuration } from './types/addDuration';
import type { AddIncrement } from './types/addIncrement';
import type { DurationKeys } from './types/durationKeys';
import type { Appendable } from '../../../globals/appendable';
import { Stylesheet } from '../../../globals/stylesheet';
import { formatDateValue } from '../../../utils/formatDateValue';
import { Container } from '../../../utils/htmlElements/container';
import { SolarTimesStatsCanvas } from './solarTimesStatsCanvas';

Stylesheet.addClass({
  SolarTimesStats: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderRight: '1px solid',
    fontSize: '10px',
    marginLeft: 'auto',
    paddingLeft: '3px',
    paddingRight: '3px',
  },
  ValueRowColRight: {
    textAlign: 'right',
    width: '5em',
  },
});
export class ValueRow extends Container {
  constructor () {
    super('div');
  }
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
    increment ??= SolarTimesStatsCanvas.increment({
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
  addRow ({ col1, col2, col3 }: Partial<Record<'col1'|'col2'|'col3', Appendable[]>>): ValueRow
  addRow ({ row }: {row: Appendable[]}): ValueRow
  addRow ({ col1 = [], col2 = [], col3 = [], row }: Partial<Record<'col1'|'col2'|'col3'|'row', Appendable[]>>) {
    row ??= [
      new Container('div', {
        classes: ['mrA'],
      }).append(...col1),
      new Container('div', {
        classes: ['ValueRowColRight'],
      }).append(...col2),
      new Container('div', {
        classes: ['ValueRowColRight'],
      }).append(...col3),
    ];
    this.append(new Container('div', {
      classes: ['d-flex'],
    }).append(...row));
    return this;
  }
  addStats ({ durations, keys, map }: Pick<AddDuration, 'durations' | 'keys'> & {map?: (val: number) => number}) {
    const stats = new SolarTimesStatsCanvas({
      height: 30,
      keys,
      map,
      stats: durations.stats,
      width: 15 * 16,
    });
    const axis = [stats.max, stats.min].map(v => new Container('div', {
      classes: ['text-end'],
    }).append(formatDateValue(v)));
    this.addRow({
      row: [
        new Container('div', {
          classes: ['SolarTimesStats'],
        })
        .append(...axis),
        stats,
      ],
    });

    this.totalKeys.push(...keys);
    return this;
  }
}
