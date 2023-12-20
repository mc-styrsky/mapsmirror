import type { Layer } from './layers';
import type { XYZ } from './xyz';

export type DrawImage = XYZ & {
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  source: Layer;
  ttl: number;
};
