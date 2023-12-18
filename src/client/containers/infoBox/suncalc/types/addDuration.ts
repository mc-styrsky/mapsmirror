import type { DurationKeys } from './durationKeys';
import type { SolarDuration } from './solarDuration';

export interface AddDuration {
  label: string
  keys: DurationKeys[]
  durations: {
    today: SolarDuration
    stats: SolarDuration[]
  }
  increment?: undefined
}
