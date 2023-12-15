export const formatDateValue = (val: number) => {
  const secs = Math.round(val / 1000);
  const {
    hours,
    minutes,
    seconds,
  } = {
    hours: Math.floor(secs / 3600),
    minutes: Math.floor(secs / 60) % 60,
    seconds: secs % 60,
  };
  return [hours, minutes, seconds].map(v => v?.toFixed(0).padStart(2, '0')).join(':');
};
