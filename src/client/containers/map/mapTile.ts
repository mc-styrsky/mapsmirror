import type { XYZ } from '../../../common/types/xyz';
import { zoomMax } from '../../../common/layers';
import { position } from '../../globals/position';
import { settings } from '../../globals/settings';
import { tileSize } from '../../globals/tileSize';
import { Container } from '../../utils/htmlElements/container';
import { drawCachedImage } from './drawCachedImage';

const pad = (1 << zoomMax).toString().length + 1;
export class MapTile extends Container<HTMLCanvasElement> {
  static id ({ x, y, z }: XYZ) {
    return `z:${
      z.toFixed(0).padStart(2, ' ')
    }, x:${
      x.toFixed(0).padStart(pad, ' ')
    }, y:${
      y.toFixed(0).padStart(pad, ' ')
    }`;
  }
  static distance ({ x, y, z }: XYZ, ref: XYZ) {
    const scale = (1 << ref.z) / (1 << z);
    const dx = (x + 0.5) * scale - ref.x;
    const dy = (y + 0.5) * scale - ref.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  constructor ({ x, y, z }: XYZ) {
    const width = tileSize;
    const height = tileSize;
    const ttl = Math.max(Math.min(17, z + Math.max(0, position.ttl)) - z, 0);

    super(Container.from('canvas', {
      dataset: {
        x: x.toFixed(0),
        y: y.toFixed(0),
        z: z.toFixed(0),
      },
      style: {
        height: `${height}px`,
        left: '50%',
        position: 'absolute',
        top: '50%',
        width: `${width}px`,
      },
    }));

    this.x = x;
    this.y = y;
    this.z = z;
    this.id = MapTile.id({ x, y, z });
    this.html.width = width;
    this.html.height = height;
    const context = this.html.getContext('2d');

    if (context) {
      Promise.all(settings.tiles.map(async (entry) => {
        const { alpha, source } = entry;
        return await drawCachedImage({ alpha, context, source, ttl, x, y, z });
      }))
      .then(draws => draws.reduce(
        (prom, draw) => prom.then(() => draw()),
        Promise.resolve(true),
      ));
    }
  }
  private x: XYZ['x'];
  private y: XYZ['x'];
  private z: XYZ['x'];


  moveTo ({ x, y, z }: XYZ) {
    const scaleZ = z >= this.z ?
      1 << z - this.z :
      1 / (1 << this.z - z);
    const size = tileSize * scaleZ;

    this.html.style.height = `${size}px`;
    this.html.style.width = `${size}px`;
    this.html.style.transform = `translate(${
      Math.floor((this.x * scaleZ - x) * tileSize)
    }px, ${
      Math.floor((this.y * scaleZ - y) * tileSize)
    }px)`;
  }

  readonly id: string;
}