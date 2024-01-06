import { MonoContainer } from '../../utils/htmlElements/monoContainer';
import { OverlayToggle } from './overlayToggle';

export class NavionicsToggle extends MonoContainer {
  static {
    this.copyInstance<'a'>(new OverlayToggle('navionics'), this);
  }
}
