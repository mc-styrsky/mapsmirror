import type { Overlay } from '../../../common/types/overlay';
import { PI2 } from '../../../common/math';
import { markers } from '../../globals/marker';
import { tileSize } from '../../globals/tileSize';


export const drawMarkers = ({
  context, x, y,
}: Overlay) => {
  markers.set().forEach(marker => {
    const markerX = (marker.x - x) * tileSize;
    const markerY = (marker.y - y) * tileSize;
    const from = 40;
    const to = 10;

    [
      { color: '#000000', width: 3 },
      { color: { navionics: '#00ff00', user: '#800000' }[marker.type], width: 1 },
    ].forEach(({ color, width }) => {
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = width;
      context.arc(
        markerX,
        markerY,
        5,
        PI2,
        0,
      );
      context.moveTo(markerX + from, markerY);
      context.lineTo(markerX + to, markerY);
      context.moveTo(markerX - from, markerY);
      context.lineTo(markerX - to, markerY);
      context.moveTo(markerX, markerY + from);
      context.lineTo(markerX, markerY + to);
      context.moveTo(markerX, markerY - from);
      context.lineTo(markerX, markerY - to);
      context.stroke();
    });
  });
};
