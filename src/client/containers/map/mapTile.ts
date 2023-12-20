import type { XYZ } from '../../../common/types/xyz';
import { modulo } from '../../../common/modulo';
import { position } from '../../globals/position';
import { settings } from '../../globals/settings';
import { tileSize } from '../../globals/tileSize';
import { createHTMLElement } from '../../utils/createHTMLElement';
import { drawCachedImage } from './drawCachedImage';

export class MapTile {
  static id ({ x, y, z }: XYZ) {
    return `${z.toFixed(0).padStart(2, '0')}_${modulo(x, 1 << z)}_${modulo(y, 1 << z)}`;
  }
  constructor ({ x, y, z }: XYZ) {
    const width = tileSize;
    const height = tileSize;
    const ttl = Math.max(Math.min(17, z + Math.max(0, position.ttl)) - z, 0);
    this.x = x;
    this.y = y;
    this.z = z;
    this.id = MapTile.id({ x, y, z });

    const canvas = createHTMLElement('canvas', {
      dataset: {
        x: x.toFixed(0),
        y: y.toFixed(0),
        z: z.toFixed(0) },
      style: {
        height: `${height}px`,
        left: '50%',
        position: 'absolute',
        top: '50%',
        width: `${width}px`,
      },
    });
    canvas.width = width;
    canvas.height = height;
    this.canvas = canvas;
    const context = canvas.getContext('2d');

    if (context) {
      settings.tiles.reduce(async (prom, entry) => {
        const { alpha, source } = entry;
        const draw = drawCachedImage({ alpha, context, source, ttl, x, y, z });
        await prom;
        await (await draw)();
        return prom;
      }, Promise.resolve());
    }
  }
  canvas: HTMLCanvasElement;
  private x: XYZ['x'];
  private y: XYZ['x'];
  private z: XYZ['x'];


  moveTo ({ x, y, z }: XYZ) {
    const scaleZ = z >= this.z ?
      1 << z - this.z :
      1 / (1 << this.z - z);
    const size = tileSize * scaleZ;

    this.canvas.style.height = `${size}px`;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.transform = `translate(${
      Math.floor((this.x * scaleZ - x) * tileSize)
    }px, ${
      Math.floor((this.y * scaleZ - y) * tileSize)
    }px)`;
  }

  distance ({ x, y, z }: XYZ) {
    const tilesThis = 1 << this.z;
    const tilesRemote = 1 << z;
    const dx = (this.x + 0.5) / tilesThis * tilesRemote - x;
    const dy = (this.y + 0.5) / tilesThis * tilesRemote - y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  readonly id: string;

  toHtml () {
    return this.canvas;
  }
}
