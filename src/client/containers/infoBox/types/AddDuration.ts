import type { DurationKeys } from './DurationKeys';
import type { SolarDuration } from './SolarDuration';

export interface AddDuration {
  label: string;
  keys: DurationKeys[];
  durations: {
    today: SolarDuration;
    stats: {
      durations: SolarDuration;
      date: Date;
    };
  };
  increment?: undefined;
}
