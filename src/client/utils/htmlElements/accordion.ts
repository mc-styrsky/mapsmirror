import { Collapse } from 'bootstrap';
import { Container } from './container';

// Caveat: Hack to include Bootstrap's JS code
new Collapse(new Container('div').html);
export class Accordion extends Container {
  constructor ({ accordionId }: {
    accordionId: string;
  }) {
    super('div', {
      classes: ['accordion'],
      id: accordionId,
    });
  }
}
