import { Container } from './container';


export class MonoContainer<Tag extends keyof HTMLElementTagNameMap = 'div'> extends Container<Tag> {
  protected constructor () {
    super('div' as unknown as Tag, {});
  }
  protected static copyInstance<Tag extends keyof HTMLElementTagNameMap = 'div'> (cont: Container<Tag>, target: typeof MonoContainer<any>) {
    target._html = cont.html;
    target.clear = () => cont.clear();
    target.append = (...items) => cont.append(...items);
    target.getBoundingClientRect = () => cont.getBoundingClientRect();
  }
  private static _html: Container<keyof HTMLElementTagNameMap>['html'];
  static get html () {
    return this._html;
  }
  static clear: Container<any>['clear'];
  static append: Container<any>['append'];
  static getBoundingClientRect: Container<any>['getBoundingClientRect'];
}
