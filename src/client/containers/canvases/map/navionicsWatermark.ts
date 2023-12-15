import { tileSize } from '../../../globals/tileSize';

export const navionicsWatermark = (async () => {
  const img = new Image();
  img.src = '/navionicsWatermark.png';
  const cnvs = new OffscreenCanvas(256, 256);
  const ctx = cnvs.getContext('2d');
  if (!ctx) return null;
  return new Promise<Uint8ClampedArray>((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, tileSize, tileSize).data);
    };
    img.onerror = () => {
      ctx.beginPath();
      ctx.fillStyle = '#f8f8f8f8';
      ctx.strokeStyle = '#f8f8f8f8';
      ctx.fillRect(0, 0, tileSize, tileSize);
      ctx.fill();
      ctx.stroke();
      resolve(ctx.getImageData(0, 0, tileSize, tileSize).data);
    };
  });
})()
.then(watermark => {
  if (!watermark) return null;
  const ret = new Uint8ClampedArray(tileSize * tileSize);
  for (let i = 0; i < ret.length;i++) {
    ret[i] = watermark[i * 4];
  }
  return ret;
});
