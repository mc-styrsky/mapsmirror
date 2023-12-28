import type { Appendable } from '../../../globals/appendable';
import { Container } from '../container';

export class AccordionBody extends Container {
  constructor ({ body, itemId }: { body: Appendable; itemId: string; }) {
    super(Container.from('div', {
      classes: [
        'accordion-collapse',
        'collapse',
        'ps-2',
        'pe-0',
      ],
      id: itemId,
    }));
    this.append(body);
  }
  show () {
    this.html.classList.add('show');
  }
  hide () {
    this.html.classList.remove('show');
  }
}
