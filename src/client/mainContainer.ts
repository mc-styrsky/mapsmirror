import { position } from './globals/position';
import { Container } from './utils/htmlElements/container';
import { MonoContainer } from './utils/htmlElements/monoContainer';

export class MainContainer extends MonoContainer {
  static refresh = () => {
    const { height, width } = this.html.getBoundingClientRect();
    console.log('new bounding rect', { height, width });
    this._height = height;
    this._width = width;
    position.refresh();
  };

  static {
    const containerId = new URL(import.meta.url).searchParams.get('container') ?? '';
    const container = document.getElementById(containerId);
    if (container instanceof HTMLDivElement) {
      this.copyInstance(new Container(container), this);
    }
    else throw Error('mainContainer needs to be a div');

    window.addEventListener('resize', () => {
      this.refresh();
    });
    this.refresh();
  }

  private static _height = NaN;
  private static _width = NaN;

  static get height () {
    return this._height;
  }
  static get width () {
    return this._width;
  }
}
