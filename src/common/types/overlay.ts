import type { Size } from './size';
import type { XYZ } from './xyz';

export type Overlay = Pick<XYZ, 'x' | 'y'> & Size & { context: CanvasRenderingContext2D; };
