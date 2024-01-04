import { markers } from './globals/marker';
import { deg2rad } from './utils/deg2rad';

let geolocationBlocked = false;
export function updateUserLocation () {
  if (geolocationBlocked) return;
  navigator.geolocation.getCurrentPosition(
    ({ coords: { accuracy, latitude, longitude }, timestamp }) => {
      markers.add({
        accuracy,
        lat: deg2rad(latitude),
        lon: deg2rad(longitude),
        timestamp,
        type: 'user',
      });
    },
    (err) => {
      if (err.code === 1) geolocationBlocked = true;
      console.warn(`ERROR(${err.code}): ${err.message}`);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    },
  );
}
