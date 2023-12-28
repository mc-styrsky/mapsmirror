import type { Appendable } from '../../../globals/appendable';
import { Container } from '../container';

export class AccordionHead extends Container {
  constructor ({ body = false, itemId, label }: {
    body?: boolean;
    itemId: string
    label: Appendable;
  }) {
    super(Container.from('div', {
      classes: [
        'accordion-header',
        'mm-menu-text',
      ],
    }));
    this.labelContainer = Container.from('div', {
      classes: [
        body ? 'accordion-button' : 'd-flex',
        'px-2',
        'py-0',
        'mm-menu-text',
      ],
      dataset: {
        bsTarget: `#${itemId}`,
        bsToggle: 'collapse',
      },
    });
    this.append(this.labelContainer);
    this.label = label;
  }

  private labelContainer: Container;

  show () {
    this.labelContainer.html.classList.remove('collapsed');
  }
  hide () {
    this.labelContainer.html.classList.add('collapsed');
  }

  set label (label: Appendable) {
    this.labelContainer.clear();
    this.labelContainer.append(label);
  }
}
