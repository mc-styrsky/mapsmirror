import type { DurationKeys } from './types/durationKeys';
import type { SolarDuration } from './types/solarDuration';
import { max, min } from '../../../../common/math';
import { Stylesheet } from '../../../globals/stylesheet';
import { Container } from '../../../utils/htmlElements/container';
import { SolarTimes } from './solarTimes';

Stylesheet.addClass({
  SolarTimesStatsCanvas: {
    backgroundColor: '#ffffff',
    height: '30px',
    width: '15em',
  },

});
export class SolarTimesStatsCanvas extends Container<HTMLCanvasElement> {
  constructor ({ height, keys, map = (val) => val, stats, width }: {
    stats: SolarDuration[];
    keys: DurationKeys[];
    height: number;
    width: number;
    map?: (val: number) => number
  }) {
    const values = stats.map(durations => map(SolarTimes.increment({ durations, keys })));
    const minValue = min(...values);
    const maxValue = max(...values);
    const scaleY = (height - 1) / (maxValue - minValue);
    const scaleX = width / stats.length;
    super(Container.from('canvas', {
      classes: ['SolarTimesStatsCanvas'],
      height,
      width,
    }));
    const context = this.html.getContext('2d');
    if (context) {
      context.beginPath();
      context.strokeStyle = '#000000';
      values.forEach((val, idx) => {
        const x = idx * scaleX;
        const y = (maxValue - val) * scaleY + 0.5;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
    }
    this.max = maxValue;
    this.min = minValue;
  }
  min: number;
  max: number;
}
