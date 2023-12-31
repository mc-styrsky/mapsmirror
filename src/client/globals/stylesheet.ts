import { entriesTyped } from '../../common/entriesTyped';
import { fromEntriesTyped } from '../../common/fromEntriesTyped';
import { Container } from '../utils/htmlElements/container';
import { MonoContainer } from '../utils/htmlElements/monoContainer';
import { kebabify } from '../utils/kebabify';

type CSSDeclaration = Partial<CSSStyleDeclaration> & Record<`--${string}`, string>

export class Stylesheet extends MonoContainer<'style'> {
  static {
    this.copyInstance<'style'>(new Container('style'), this);
  }
  private static readonly keys = new Set<string>();
  static add (elements: Record<string, CSSDeclaration>) {
    entriesTyped(elements).map(([keyRaw, style]) => {
      const key = kebabify(keyRaw);

      if (this.keys.has(key)) throw Error(`"${key}" already defined`);
      this.keys.add(key);

      const rules = entriesTyped(style).map(([k, v]) => `${kebabify(k)}: ${v?.toString()}`);
      this.append(`${key} { ${rules.join('; ')} }\n`);
    });
  }
  static addClass (classes: Record<string, CSSDeclaration>) {
    this.add(fromEntriesTyped(
      entriesTyped(classes)
      .map(([className, style]) => [`.${className}`, style]),
    ));
  }
}


Stylesheet.addClass({
  AccordionLabel: {
    backgroundColor: '#ffffff40 !important',
  },
  fetch: {
    alignItems: 'center',
    backgroundColor: 'var(--bs-accordion-btn-bg)',
    border: '0',
    borderRadius: '0',
    color: 'var(--bs-accordion-btn-color)',
    display: 'flex',
    // fontSize: '1rem',
    overflowAnchor: 'none',
    padding: 'var(--bs-accordion-btn-padding-y) var(--bs-accordion-btn-padding-x)',
    position: 'relative',
    textAlign: 'left',
    transition: 'var(--bs-accordion-transition)',
    width: '100%',
  },
  'fetch::after': {
    '--bs-spinner-animation-name': 'spinner-border',
    '--bs-spinner-animation-speed': '0.75s',
    '--bs-spinner-border-width': '0.2em',
    animation: 'var(--bs-spinner-animation-speed) linear infinite var(--bs-spinner-animation-name)',
    border: 'var(--bs-spinner-border-width) solid currentcolor',
    borderRadius: '50%',
    borderRightColor: 'transparent',
    content: '""',
    flexShrink: '0',
    height: 'var(--bs-accordion-btn-icon-width)',
    marginLeft: 'auto',
    transition: 'var(--bs-accordion-btn-icon-transition)',
    width: 'var(--bs-accordion-btn-icon-width)',
  },
  MapContainerStyle: {
    height: '100%',
    left: '0px',
    overflow: 'hidden',
    position: 'absolute',
    top: '0px',
    width: '100%',
  },
});
