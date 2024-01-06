import type { Appendable } from '../../../globals/appendable';
import { Container } from '../container';

export class AccordionHead extends Container {
  constructor ({ body = false, itemId, label }: {
    body?: boolean;
    itemId: string
    label: Appendable;
  }) {
    super('div', {
      classes: [
        'accordion-header',
        'd-flex',
        'AccordionLabel',
      ],
    });
    this.hasBody = body;
    this.labelContainer = new Container('div', {
      classes: [
        'w-100',
        'd-flex',
        body ? 'accordion-button' : null,
        'px-2',
        'py-0',
        'AccordionLabel',
      ],
      dataset: {
        bsTarget: `#${itemId}`,
        bsToggle: 'collapse',
      },
    });
    this.done();
    this.append(this.labelContainer);
    this.label = label;
  }

  private readonly hasBody: boolean;
  private readonly labelContainer: Container;

  show () {
    this.labelContainer.html.classList.remove('collapsed');
  }
  hide () {
    this.labelContainer.html.classList.add('collapsed');
  }
  done () {
    if (this.hasBody) {
      this.labelContainer.html.classList.add('accordion-button');
      this.labelContainer.html.classList.remove('fetch');
    }
  }
  progress () {
    if (this.hasBody) {
      this.labelContainer.html.classList.remove('accordion-button');
      this.labelContainer.html.classList.add('fetch');
    }
  }

  set label (label: Appendable) {
    this.labelContainer.clear();
    this.labelContainer.append(label);
  }
}
