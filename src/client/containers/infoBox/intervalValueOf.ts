import { halfDay } from '../../utils/halfDay';

export const intervalValueOf = ({ end: endDate, solarNoon: noonDate, start: startDate }: { end: Date; start: Date; solarNoon: Date; }) => {
  const end = endDate.valueOf();
  const start = startDate.valueOf();
  const startNaN = Number.isNaN(start);
  const endNaN = Number.isNaN(end);
  const noon = noonDate.valueOf();
  if (startNaN && endNaN) return 0;
  if (startNaN) return end <= noon ?
    end - (noon - halfDay) :
    end - noon;
  if (endNaN) return start >= noon ?
    noon + halfDay - start :
    noon - start;

  return end - start;
};
