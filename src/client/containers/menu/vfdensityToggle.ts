import { MonoContainer } from '../../utils/htmlElements/monoContainer';
import { OverlayToggle } from './overlayToggle';

export class VfdensityToggle extends MonoContainer {
  static {
    this.copyInstance<'a'>(new OverlayToggle('vfdensity'), this);
  }
}
