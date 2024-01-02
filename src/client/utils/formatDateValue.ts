import { floor, round } from '../../common/math';

export function formatDateValue (val: number) {
  const secs = round(val / 1000);
  const {
    hours, minutes, seconds,
  } = {
    hours: floor(secs / 3600),
    minutes: floor(secs / 60) % 60,
    seconds: secs % 60,
  };
  return [hours, minutes, seconds].map(v => v?.toFixed(0).padStart(2, '0')).join(':');
}
