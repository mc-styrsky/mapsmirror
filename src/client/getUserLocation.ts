import { position } from './position';
import { updateInfoBox } from './updateInfoBox';

let geolocationBlocked = false;
export const updateGeoLocation = async () => {
  if (geolocationBlocked) return position.user;
  await new Promise((resolve: PositionCallback, reject: PositionErrorCallback) => {
    return navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      },
    );
  })
  .then((pos) => {
    const { accuracy, latitude, longitude } = pos.coords;
    position.user = {
      accuracy,
      latitude: latitude * Math.PI / 180,
      longitude: longitude * Math.PI / 180,
      timestamp: pos.timestamp,
    };
  })
  .catch((err) => {
    if (err.code === 1) geolocationBlocked = true;
    console.warn(`ERROR(${err.code}): ${err.message}`);
  });

  updateInfoBox();
  return position.user;
};
