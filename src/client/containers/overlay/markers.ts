import type { Overlay } from '../../../common/types/overlay';
import { position } from '../../globals/position';
import { tileSize } from '../../globals/tileSize';


export const drawMarkers = ({
  context, x, y,
}: Overlay) => {
  position.markers.forEach(marker => {
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
        2 * Math.PI,
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
