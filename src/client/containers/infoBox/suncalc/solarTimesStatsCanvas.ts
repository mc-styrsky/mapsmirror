import type { DurationKeys } from './types/durationKeys';
import type { SolarDuration } from './types/solarDuration';
import { stylesheet } from '../../../globals/stylesheet';
import { Container } from '../../../utils/htmlElements/container';
import { SolarTimesStatics } from './solarTimes/statics';

stylesheet.addClass({
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
    const values = stats.map(durations => map(SolarTimesStatics.increment({ durations, keys })));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const scaleY = (height - 1) / (max - min);
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
        const y = (max - val) * scaleY + 0.5;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
    }
    this.max = max;
    this.min = min;
  }
  min: number;
  max: number;
}
