
export const rad2deg = (phi: number, pad = 0, axis = ' -') => {
  const deg = phi * 180 / Math.PI;
  const degrees = deg | 0;
  const minutes = (Math.abs(deg) - Math.abs(degrees)) * 60;

  return `${
    axis[deg < 0 ? 1 : 0] ?? ''
  }${
    (deg < 0 ? - degrees : degrees).toFixed(0).padStart(pad, '0')
  }° ${
    minutes.toFixed(3).padStart(6, '0')
  }'`;
};
