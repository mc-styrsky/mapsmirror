import { Container } from './container';


export class MonoContainer<Tag extends keyof HTMLElementTagNameMap = 'div'> extends Container<Tag> {
  protected constructor () {
    super('div' as unknown as Tag, {});
  }
  protected static copyInstance<Tag extends keyof HTMLElementTagNameMap = 'div'> (cont: Container<Tag>, target: typeof MonoContainer) {
    target.isMonoContainer = MonoContainer.isMonoContainer;
    target._html = cont.html;
    target.clear = () => cont.clear();
    target.append = (...items) => cont.append(...items);
    target.getBoundingClientRect = () => cont.getBoundingClientRect();
  }
  private static _html: Container<any>['html'];
  static get html () {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._html;
  }
  static clear: Container<any>['clear'];
  static append: Container<any>['append'];
  static getBoundingClientRect: Container<any>['getBoundingClientRect'];
  static isMonoContainer = Symbol();
}
