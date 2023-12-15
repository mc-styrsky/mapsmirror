import type { AddDuration } from './types/AddDuration';
import type { AddIncrement } from './types/AddIncrement';
import { createBr, createHTMLElement } from '../../utils/createHTMLElement';
import { formatDateValue } from '../../utils/formatDateValue';
import { SolarTimes } from './solarTimes';

export class ValueRow {
  lines: HTMLElement[] = [];
  total = {
    stats: 0,
    today: 0,
  };
  fill = (label: string, sum: number) => this.add({
    increment: {
      stats: sum - this.total.stats,
      today: sum - this.total.today,
    },
    label,
  });
  add ({ durations, increment, keys, label }: AddDuration | AddIncrement) {
    increment ??= {
      stats: SolarTimes.increment({
        durations: durations.stats.durations,
        keys,
      }),
      today: SolarTimes.increment({
        durations: durations.today,
        keys,
      }),
    };

    this.total.stats += increment.stats;
    this.total.today += increment.today;

    return this.addRow({
      col1: [label],
      col2: [
        increment.today ? `+${formatDateValue(increment.today)}` : '',
        createBr(),
        createHTMLElement({
          style: { fontSize: '70%' },
          tag: 'span',
          zhilds: [increment.stats ? `+${formatDateValue(increment.stats)}` : '',
          ],
        }),
      ],
      col3: [
        formatDateValue(this.total.today),
        createBr(),
        createHTMLElement({
          style: { fontSize: '70%' },
          tag: 'span',
          zhilds: [formatDateValue(this.total.stats)],
        }),
      ],
    });
  }
  addRow ({ col1, col2, col3 }: Record<'col1'|'col2'|'col3', (string|HTMLElement)[]>) {
    this.lines.push(createHTMLElement({
      classes: ['d-flex'],
      tag: 'div',
      zhilds: [
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
      ],
    }));
    return this;
  }
}
