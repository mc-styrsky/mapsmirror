import { markers } from './globals/marker';
import { deg2rad } from './utils/deg2rad';

let geolocationBlocked = false;
export async function updateUserLocation () {
  if (geolocationBlocked) return;
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
  .then(({ coords: { accuracy, latitude, longitude }, timestamp }) => {
    markers.add({
      accuracy,
      lat: deg2rad(latitude),
      lon: deg2rad(longitude),
      timestamp,
      type: 'user',
    });
  })
  .catch((err) => {
    if (err.code === 1) geolocationBlocked = true;
    console.warn(`ERROR(${err.code}): ${err.message}`);
  });
}
