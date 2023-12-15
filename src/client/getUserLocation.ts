import { updateInfoBox } from './containers/infoBox/updateInfoBox';
import { Marker } from './globals/marker';
import { position } from './globals/position';
import { deg2rad } from './utils/deg2rad';

let geolocationBlocked = false;
export const updateUserLocation = async () => {
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
      latitude: deg2rad(latitude),
      longitude: deg2rad(longitude),
      timestamp: pos.timestamp,
    };
    new Marker({
      lat: latitude,
      lon: longitude,
      type: 'user',
    });
  })
  .catch((err) => {
    if (err.code === 1) geolocationBlocked = true;
    console.warn(`ERROR(${err.code}): ${err.message}`);
  });

  updateInfoBox();
  return position.user;
};
